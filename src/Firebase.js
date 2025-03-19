import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCyDI99ZuHHUEY2WESdaUp-wviUGwo4AwY',
  databaseURL: 'https://senzehch-default-rtdb.firebaseio.com',
  storageBucket: "senzehch.appspot.com",
  projectId: 'senzehch',
};

let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = firebase.auth();

export {db, auth};
