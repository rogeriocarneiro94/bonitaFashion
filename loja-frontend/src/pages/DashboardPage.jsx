import React from 'react';
import { Link } from 'react-router-dom';

function DashboardPage() {

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao sistema!</p>

      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Início</Link>
          </li>
          <li>
            <Link to="/produtos">Produtos</Link>
          </li>
          <li>
            <Link to="/clientes">Clientes</Link>
          </li>
          <li>
              <Link to="/vendas">Vendas</Link>
          </li>
        </ul>
      </nav>

      <button onClick={handleLogout}>Sair (Logout)</button>
    </div>
  );
}

export default DashboardPage;