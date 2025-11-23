import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutoPage from './pages/Produtos/ProdutoPage';
import EstoquePage from './pages/Produtos/EstoquePage'
import ClientePage from './pages/ClientePage';
import VendaPage from './pages/Venda';
import Funcionario from './pages/Funcionarios/funcionario';
import CategoriaPage from './pages/Produtos/CategoriaPage';
import HistoricoVendas from './pages/HistoricoVendas';

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
                    {/* Vendas */}
                    <Route path="/vendas" element={<VendaPage />} />
                    <Route path="/historico-vendas" element={<HistoricoVendas />} />
                    {/* Produtos (Rotas Atualizadas) */}
                    <Route path="/estoque" element={<EstoquePage />} /> {/* Geralmente "Produtos" no menu leva ao
                        Estoque */}
                    <Route path="/produtos" element={<ProdutoPage />} />
                    <Route path="/categorias" element={<CategoriaPage />} />
                    {/* Clientes */}
                    <Route path="/clientes" element={<ClientePage />} />
                    {/* Funcionários */}
                    <Route path="/funcionarios" element={<Funcionario />} />

          <Route index element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Rota Padrão */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;