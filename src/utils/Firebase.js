'use client'
import firebase from 'firebase/app'
import { useSelector } from 'react-redux';
import { websettingsData } from 'src/store/reducers/webSettings';
require('firebase/auth')
require('firebase/firestore')

const FirebaseData = () => {
  const websettingsdata = useSelector(websettingsData);

  const apiKeyData = websettingsdata && websettingsdata?.firebase_api_key;
  const authDomainData = websettingsdata && websettingsdata?.firebase_auth_domain;
  const databaseURLData = websettingsdata && websettingsdata?.firebase_database_url;
  const projectIdData = websettingsdata && websettingsdata?.firebase_project_id;
  const storageBucketData = websettingsdata && websettingsdata?.firebase_storage_bucket;
  const messagingSenderIdData = websettingsdata && websettingsdata?.firebase_messager_sender_id;
  const appIdData = websettingsdata && websettingsdata?.firebase_app_id;
  const measurementIdData = websettingsdata && websettingsdata?.firebase_measurement_id;

  let firebaseConfig = {
      apiKey: apiKeyData ? apiKeyData : "AIzaSyCx_9J_-fSUmsDsLVt5GuiP1ivHBb2lxog",
      authDomain: authDomainData ? authDomainData : "freemcqquiz.firebaseapp.com",
      databaseURL: databaseURLData ? databaseURLData : "xxxxx",
      projectId: projectIdData ? projectIdData : "freemcqquiz",
      storageBucket: storageBucketData ? storageBucketData : "freemcqquiz.appspot.com",
      messagingSenderId: messagingSenderIdData ? messagingSenderIdData : "372341214414",
      appId: appIdData ? appIdData : "1:372341214414:web:aae523732d38408333149f",
      measurementId: measurementIdData ? measurementIdData : "G-BT4PQPTF4Y",
  }

  // eslint-disable-next-line
  if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig)
  } else {
    firebase.app() // if already initialized, use that one
  }

  const auth = firebase.auth()

  const db = firebase.firestore()

  const googleProvider = new firebase.auth.GoogleAuthProvider()

  const facebookprovider = new firebase.auth.FacebookAuthProvider()

  return { auth, googleProvider, facebookprovider, firebase, db }
}

export default FirebaseData
