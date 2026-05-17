import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

window.onerror = function(msg, url, line, col, error) {
  alert("JS Error: " + msg + "\nAt: " + url + ":" + line + ":" + col);
  return false;
};

window.onunhandledrejection = function(event) {
  alert("Unhandled Promise Rejection: " + event.reason);
};

console.log("Aura Main: Initializing React DOM...");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
