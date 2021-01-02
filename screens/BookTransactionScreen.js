import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, 
    TextInput, Image, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js';
import * as firebase from 'firebase';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId: '',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
        const buttonState = this.state.buttonState;
        if(buttonState === "BookId"){
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
              });
        }
        else if(buttonState === "StudentId"){
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
              });
        }
      
    }

    handleTransactions = async() => {
        var transactionType = await this.checkBookAvailability();
        console.log("ttype", transactionType);
        if(!transactionType){
            Alert.alert("Book not available in the library");
            this.setState({
                scannedBookId : "",
                scannedStudentId : ""
            })
        }
        else if( transactionType === "Issue"){
            var isStudentEligible = await this.checkStudEligibilityIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("Book Issued to student");
            }
        }
        else{
            var isStudentEligible = await this.checkStudEligibilityReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("Book Returned to library");
            }
        }
    }

    checkBookAvailability = async() => {
        console.log("in checkBookAvailability")
        const bookRef = await db.collection("books").where("bookId","==", this.state.scannedBookId).get();
        var transactionType = "";
        if(bookRef.docs.length === 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map((doc) => {
                var book = doc.data();
                if(book.bookAvailability){
                    transactionType = "Issue";
                }
                else{
                    transactionType = "Return";
                }
            })
        }
        console.log("type", transactionType);
        return transactionType;
    }

    checkStudEligibilityIssue = async() => {
        console.log("in checkStudEligibilityIssue")
        const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
            isStudentEligible = false;
            this.setState({
                scannedBookId : "",
                scannedStudentId : ""
            });
            Alert.alert("The student id doesn not exist");
        }
        else{
            studentRef.docs.map((doc) => {
                    var student = doc.data();
                    if(student.noOfBooksIssued <= 2){
                        isStudentEligible = true;
                    }
                    else{
                        isStudentEligible = false;
                        this.setState({
                            scannedBookId : "",
                            scannedStudentId : ""
                        });
                        Alert.alert("The student has already issued 2 books");
                    }
                }
            )
        }
        console.log("isEligible Issue", isStudentEligible);
        return isStudentEligible;
    }

    checkStudEligibilityReturn = async() => {
        console.log("in checkStudEligibilityReturn")
        const transactionRef = await db.collection("transactions").where("bookId", "==", this.state.scannedBookId).get();
        var isStudentEligible = "";
        transactionRef.docs.map((doc) => {
            var transaction = doc.data();
            if(transaction.studentId == this.state.scannedStudentId){
                isStudentEligible = true;
            }
            else{
                isStudentEligible = false;
                Alert.alert("Student not eligible");
                this.setState({
                    scannedBookId : "",
                    scannedStudentId : ""
                });
            }
        })
        console.log("isEligible Return", isStudentEligible)
        return isStudentEligible;
    }

    initiateBookIssue = async() => {
        console.log("in fkn");
        await db.collection("transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'transactionType' : "Issue"
        });

        await db.collection("books").doc(this.state.scannedBookId)
        .update({
            'bookAvailability' : false
        });

        await db.collection("students").doc(this.state.scannedStudentId)
        .update({
            'noOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        });

        //alert("Book Issued");
        ToastAndroid.show("Book Issued", ToastAndroid.SHORT);

        this.setState({
            scannedBookId : "",
            scannedStudentId : ""
        })
    }

    initiateBookReturn = async() => {
        console.log("returning book");
        //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })

      ToastAndroid.show("Book Returned", ToastAndroid.SHORT);

        this.setState({
            scannedBookId : "",
            scannedStudentId : ""
        })
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== 'normal' && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View>
              <Image
                  source={require('../assets/booklogo.jpg')}
                  style={{width:200,height:200}}
              />
              <Text style={{textAlign:'center', fontSize:30}}>Wily</Text>
          </View>
            <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder="Book Id"
                onChangeText={(text)=>{this.setState({scannedBookId:text})}}
                value={this.state.scannedBookId}
                />     
                <TouchableOpacity
                    onPress={()=>{
                        this.getCameraPermissions("BookId");
                    }}
                    style={styles.scanButton}>
                    <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder="Student Id"
                onChangeText={(text)=>{this.setState({scannedStudentId:text})}}
                value={this.state.scannedStudentId}
                />     
                <TouchableOpacity
                    onPress={()=>{
                        this.getCameraPermissions("StudentId")
                    }}
                    style={styles.scanButton}>
                    <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                    onPress={ ()=>{
                        this.handleTransactions();
                    }}
                    style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    buttonText:{
      fontSize: 15,
      textAlign : 'center',
      marginTop: 10
    },
    inputView:{
        flexDirection:'row',
        margin: 20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize: 20
    },
    scanButton:{
        backgroundColor:"pink",
        width:50,
        borderWidth: 1.5,
        borderLeftWidth:0
    },
    submitButton:{
        backgroundColor : "#FBC02D",
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:"center",
        fontSize: 20,
        color : "white",
        fontWeight : "bold"
    }
  });