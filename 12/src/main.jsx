import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('🟢 main.jsx loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ לא נמצא אלמנט עם id="root" בדף HTML!');
} else {
  console.log('✅ נמצא root:', rootElement);
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🟢 ReactDOM.render הושלם');
