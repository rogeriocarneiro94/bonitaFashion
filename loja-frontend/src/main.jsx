// Local: src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Importa o App (apenas uma vez)
import './index.css'
import Modal from 'react-modal'; // Importa o Modal

// Define o elemento raiz do app para o Modal (corrige o 'Tab')
Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)