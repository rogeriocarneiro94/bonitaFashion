// Local: src/components/Layout.jsx

import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
// Importa os ícones de seta que você instalou
import { BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';

function Layout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">

      {/* --- O Menu Lateral (Sidebar) --- */}
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>

        {/* O botão de recolher/expandir */}
        <button onClick={toggleSidebar} className="sidebar-toggle">
          {isSidebarOpen ? <BsArrowLeftShort /> : <BsArrowRightShort />}
        </button>

        <h3>Bonita Fashion</h3>

        <nav>
          <ul>
            <li>
              <Link to="/dashboard">
                <span className="link-icon">🏠</span>
                <span className="link-text">Início</span>
              </Link>
            </li>
            <li>
              <Link to="/vendas">
                <span className="link-icon">🛒</span>
                <span className="link-text">Nova Venda (PDV)</span>
              </Link>
            </li>
            <li>
              <Link to="/produtos">
                <span className="link-icon">📦</span>
                <span className="link-text">Produtos</span>
              </Link>
            </li>
            <li>
              <Link to="/clientes">
                <span className="link-icon">👥</span>
                <span className="link-text">Clientes</span>
              </Link>
            </li>
            <li>
              <Link to="/funcionarios">
                <span className="link-icon">👤</span>
                <span className="link-text">Funcionários</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* O rodapé do menu */}
        <div className="sidebar-footer">
          <button onClick={handleLogout}>
            <span className="link-icon">🚪</span>
            <span className="link-text">Sair (Logout)</span>
          </button>
        </div>

      {/* ESTA É A TAG DE FECHAMENTO QUE ESTAVA FALTANDO */}
      </aside>

      {/* O conteúdo principal da página */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;