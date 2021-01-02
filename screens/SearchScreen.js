import React from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import db from '../config';
import { ScrollView, FlatList } from 'react-native-gesture-handler';

export default class Searchscreen extends React.Component {
  constructor(){
    super();
    this.state = {
      allTransactions : [],
      lastVisibleTransaction : null,
      search : ''
    }
  }

  searchTransactions= async(text) =>{
    console.log("in searchTransactions")
    var enteredText = text.split("") 
    this.setState({
      allTransactions : [],
    })
    if (enteredText[0].toUpperCase() ==='B'){
      const transaction =  await db.collection("transactions").where('bookId','==',text).get();
      console.log("in searchTransactions B")
      transaction.docs.map((doc)=>{
        console.log("search trans", doc.data());
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase() === 'S'){
      const transaction = await db.collection('transactions').where('studentId','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  componentDidMount = async() => {
    const query = await db.collection("transactions").limit(10).get();
    query.docs.map((doc)=>{
      console.log("mount", doc.data())
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc,
        
      })
    })
    
  }

  fetchMoreTransactions = async() => {
    var text = this.state.search.toUpperCase()
    console.log("fetch transactions", text); 
    var enteredText = text.split("")

      
      if (enteredText[0].toUpperCase() ==='B'){
      const query = await db.collection("transactions").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      query.docs.map((doc)=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
      else if(enteredText[0].toUpperCase() === 'S'){
        const query = await db.collection("transactions").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
  }
    render() {
      return (
        /*<ScrollView>
          { this.state.allTransactions.map((transaction, index)=>{
            return(
              <View key={index}>
              <Text>{"Book Id" + transaction.bookId}</Text>
              <Text>{"Student Id" + transaction.studentId}</Text>
              <Text>{"Type" + transaction.transactionType}</Text>
              <Text>{"Date" + transaction.date}</Text>
              </View>
            )
          })

          }
        </ScrollView>*/
        <View style={styles.container}>
          <View style={styles.searchBar}>
          <TextInput 
          style ={styles.bar}
          placeholder = "Enter Book Id or Student Id"
          onChangeText={(text)=>{this.setState({search:text})}}/>
          <TouchableOpacity
            style = {styles.searchButton}
            onPress={()=>{this.searchTransactions(this.state.search)}}
          >
            <Text>Search</Text>
          </TouchableOpacity>
          </View>
          <FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
            <View style={{borderBottomWidth: 2}}>
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached = {this.fetchMoreTransactions}
          onEndReachedThreshold = {0.7}
          />
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })