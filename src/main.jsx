import React from 'react';
import ReactDOM from 'react-dom/client';
import Blackjack from './App'; // Importamos tu juego desde App.jsx

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Blackjack />
  </React.StrictMode>
)