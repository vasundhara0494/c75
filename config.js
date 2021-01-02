import * as firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyDTcuEhkZqT3Ak-nAMq-ipcoVqh3kh_lDs",
    authDomain: "c-71-c4162.firebaseapp.com",
    databaseURL: "https://c-71-c4162.firebaseio.com",
    projectId: "c-71-c4162",
    storageBucket: "c-71-c4162.appspot.com",
    messagingSenderId: "51234456308",
    appId: "1:51234456308:web:4137abdc1b9e6989ea14a1"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();