import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@khmyznikov/pwa-install';

// TypeScript already knows about the custom element due to PWAInstallProps declaration in @khmyznikov/pwa-install/dist/types/index.d.ts
// Removing the explicit 'any' declaration to prevent TS2717 "Subsequent property declarations must have the same type" error.

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