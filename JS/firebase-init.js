import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import * as firebaseAuth from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJFpj7XaD63LLlLamhSr5FG9NfJjujZCU",
  authDomain: "web-project-aaf1d.firebaseapp.com",
  projectId: "web-project-aaf1d",
  storageBucket: "web-project-aaf1d.appspot.com",
  messagingSenderId: "304507208675",
  appId: "1:304507208675:web:55add1cd6bf1d086b096d6",
  measurementId: "G-RKKQW9ZDDG",
};

const app = initializeApp(firebaseConfig);

window.auth = firebaseAuth.getAuth(app);
window.firebaseAuthFunctions = firebaseAuth;
