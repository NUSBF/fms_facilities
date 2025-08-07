import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';

// Force WebSocket to use http protocol instead of https when connecting
// This fixes the 'wss://nusbf.ncl.ac.uk:3002/ws' connection failure
window.__WEBPACK_DEV_SERVER_PROTOCOL__ = 'ws';
window.__WEBPACK_DEV_SERVER_WDS_SOCKET_HOST__ = 'localhost';
window.__WEBPACK_DEV_SERVER_WDS_SOCKET_PATH__ = '/ws';
window.__WEBPACK_DEV_SERVER_WDS_SOCKET_PORT__ = 3002;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
