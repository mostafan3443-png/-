import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import moment from 'jalali-moment';

// Set Jalali-moment to use Persian locale globally
moment.locale('fa');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);