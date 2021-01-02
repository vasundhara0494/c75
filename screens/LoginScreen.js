import React from 'react';
import { Text, View, StyleSheet,Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            emailId : '',
            password : '',
        }
    }

    login = async(email, password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                if(response){
                    this.props.navigation.navigate("Transaction");
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found' :
                        Alert.alert("user doesn't exist");
                        console.log("Doesn't exist");
                        break;
                    case 'auth/invalid-email' :
                        Alert.alert('incorrect email/password');
                        console.log("invalid");
                }
            }
        }
        else{
            Alert.alert('Enter email & password');
        }
    }

    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
                <View>
                    <Image
                        source={require('../assets/booklogo.jpg')}
                        style={{width:200,height:200}}
                    />
                    <Text style={{textAlign:'center', fontSize:30}}>Wily</Text>
                </View>
                <View>
                    <TextInput
                    style={styles.loginBox}
                    placeholder="abc@gmail.com"
                    onChangeText={(text)=>{this.setState({
                        emailId: text
                    })}}
                    />
                    <TextInput
                    style={styles.loginBox}
                    secureTextEntry = {true}
                    placeholder="password"
                    onChangeText={(text)=>{this.setState({
                        password: text
                    })}}
                    />
                </View>
                
                <View>
                    <TouchableOpacity
                    style={styles.submitButton}
                    onPress={()=>{this.login(this.state.emailId ,this.state.password)}}
                    >
                    <Text style={{textAlign:'center'}}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    },
    submitButton:{
        width:90,
        borderWidth:1,
        marginTop:20,
        paddingTop:5,
        borderRadius:7
    }
  })