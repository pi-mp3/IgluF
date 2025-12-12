import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import './i18n';
import { AuthProvider } from './context/AuthContext';

// Polyfill for process.nextTick required by simple-peer
// @ts-ignore
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { env: {} };
}
// @ts-ignore
if (!window.process.nextTick) {
  // @ts-ignore
  window.process.nextTick = function(fn: Function, ...args: any[]) {
    Promise.resolve().then(() => fn(...args));
  };
}
// @ts-ignore
window.global = window;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
