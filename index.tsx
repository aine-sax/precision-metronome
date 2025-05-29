import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // This error is critical for the app to run, so throwing is appropriate.
  throw new Error("Could not find root element to mount to. Ensure an element with ID 'root' exists in your HTML.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);