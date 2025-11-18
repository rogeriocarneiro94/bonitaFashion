import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
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

      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>

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
              <Link to="/historico-vendas">
                <span className="link-icon">📜</span>
                <span className="link-text">Histórico</span>
              </Link>
            </li>
            <li>
              <Link to="/produtos">
                <span className="link-icon">📦</span>
                <span className="link-text">Produtos</span>
              </Link>
            </li>
            <li>
              <Link to="/categorias">
                <span className="link-icon">🏷️</span>
                <span className="link-text">Categorias</span>
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

        <div className="sidebar-footer">
          <button onClick={handleLogout}>
            <span className="link-icon">🚪</span>
            <span className="link-text">Sair (Logout)</span>
          </button>
        </div>

      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;