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
      apiKey: apiKeyData ? apiKeyData : "xxxxxx",
      authDomain: authDomainData ? authDomainData : "xxxxx",
      databaseURL: databaseURLData ? databaseURLData : "xxxxx",
      projectId: projectIdData ? projectIdData : "xxxxx",
      storageBucket: storageBucketData ? storageBucketData : "xxxxx",
      messagingSenderId: messagingSenderIdData ? messagingSenderIdData : "xxxxx",
      appId: appIdData ? appIdData : "xxxxx",
      measurementId: measurementIdData ? measurementIdData : "xxxxx",
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
