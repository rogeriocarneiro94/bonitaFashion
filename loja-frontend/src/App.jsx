import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutoPage from './pages/ProdutoPage';
import ClientePage from './pages/ClientePage';
import VendaPage from './pages/VendaPage';
import FuncionarioPage from './pages/FuncionarioPage';
import CategoriaPage from './pages/CategoriaPage';
import HistoricoVendasPage from './pages/HistoricoVendasPage';

// Layout
import Layout from './components/Layout';

import './App.css';

// Rota Privada
function PrivateRoute() {
  const token = localStorage.getItem('token');
  return token ? <Layout /> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Privadas */}
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vendas" element={<VendaPage />} />
          <Route path="/historico-vendas" element={<HistoricoVendasPage />} />
          <Route path="/produtos" element={<ProdutoPage />} />
          <Route path="/categorias" element={<CategoriaPage />} />
          <Route path="/clientes" element={<ClientePage />} />
          <Route path="/funcionarios" element={<FuncionarioPage />} />

          <Route index element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Rota Padrão */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;