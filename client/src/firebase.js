// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'mern-estate-7e570.firebaseapp.com',
  projectId: 'mern-estate-7e570',
  storageBucket: 'mern-estate-7e570.appspot.com',
  messagingSenderId: '662604697311',
  appId: '1:662604697311:web:3194ade50c82cb0dce236a',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
