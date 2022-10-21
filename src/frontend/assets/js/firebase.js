// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  appId: "1:70471515696:web:5fcbf693f473ff4b4e77f5",
  projectId: "streeteasyclone",
  measurementId: "G-39XDR0NHSS",
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
