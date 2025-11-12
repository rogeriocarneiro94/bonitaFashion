// Local: src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutoPage from './pages/ProdutoPage';
import ClientePage from './pages/ClientePage';
import VendaPage from './pages/VendaPage';
import './App.css';


function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota 1: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota 2: Dashboard (Protegida) */}
        <Route
          path="/dashboard"
          element={ <PrivateRoute><DashboardPage /></PrivateRoute> }
        />

        {/* Rota 3: Produtos (Protegida) */}
        <Route
          path="/produtos"
          element={ <PrivateRoute><ProdutoPage /></PrivateRoute> }
        />

        {/* Rota 4: Clientes (Protegida) - NOVA ROTA */}
        <Route
          path="/clientes"
          element={ <PrivateRoute><ClientePage /></PrivateRoute> } // <-- 2. ADICIONE A ROTA
        />

        {/* Rota 5: Vendas (Protegida) - NOVA ROTA */}
        <Route
            path="/vendas"
            element={ <PrivateRoute><VendaPage /></PrivateRoute> } // <-- 2. ADICIONE A ROTA
        />

        {/* Rota Padrão */}
        <Route
          path="*"
          element={localStorage.getItem('token') ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;