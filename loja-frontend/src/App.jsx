// Local: src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Nossas Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutoPage from './pages/ProdutoPage';
import ClientePage from './pages/ClientePage';
import VendaPage from './pages/VendaPage';
import FuncionarioPage from './pages/FuncionarioPage';

// Nosso novo Layout
import Layout from './components/Layout';

import './App.css';

// Componente que verifica se o usuário está logado
// Se sim, mostra o Layout (que por sua vez mostra a página correta)
// Se não, redireciona para o Login.
function PrivateRoute() {
  const token = localStorage.getItem('token');
  return token ? <Layout /> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
        <Toaster
                position="top-right" // Posição
                toastOptions={{
                  duration: 3000, // Duração de 3 segundos
                }}
              />
      <Routes>
        {/* Rota 1: Login (pública) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota 2: Rotas Protegidas (privadas) */}
        <Route path="/" element={<PrivateRoute />}>
          {/* Essas rotas são "filhas" do Layout (serão renderizadas no <Outlet>) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/produtos" element={<ProdutoPage />} />
          <Route path="/clientes" element={<ClientePage />} />
          <Route path="/vendas" element={<VendaPage />} />
          <Route path="/funcionarios" element={<FuncionarioPage />} />

          {/* Redireciona "/" para "/dashboard" se estiver logado */}
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Rota Padrão: Se não achar nada, vai para o login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;