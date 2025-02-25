// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD27CXgIOOzddupt3VIptop-R9tVVxB-ZU",
  authDomain: "eatable-21edf.firebaseapp.com",
  projectId: "eatable-21edf",
  storageBucket: "eatable-21edf.appspot.com",
  messagingSenderId: "453116360096",
  appId: "1:453116360096:web:385779605892ab708aa0c5",
  measurementId: "G-JZC4SK261L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "HomePage");
export const auth = getAuth(app); 