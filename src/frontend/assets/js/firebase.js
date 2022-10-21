// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB74O9lFei47J9yK26DOmPMFr1In0QUpIo",
  authDomain: "streeteasyclone.firebaseapp.com",
  databaseURL: "https://streeteasyclone.firebaseio.com",
  projectId: "streeteasyclone",
  storageBucket: "streeteasyclone.appspot.com",
  messagingSenderId: "70471515696",
  appId: "1:70471515696:web:5fcbf693f473ff4b4e77f5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("🔥 up");

window.memosGlobal = { ga: {} };
window.memosGlobal.ga.event = ({ event, params }) => {
  params = { ...params, app_version: window.APP_VERSION };
  if (window.APP_VERSION === "COMMIT") console.log({ event, params });
  logEvent(analytics, event, params);
};
