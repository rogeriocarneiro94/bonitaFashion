import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu } from 'lucide-react'; // Ícones
import Sidebar from './Sidebar'; // (Seu componente Sidebar)
import './Layout.css'; // (Seu CSS de layout)

const Layout = () => {
  const navigate = useNavigate();

  // --- LER O NOME SALVO ---
  const nomeUsuario = localStorage.getItem('usuario_nome') || 'Usuário';
  const perfilUsuario = localStorage.getItem('usuario_perfil') || 'Vendedor';

  const handleLogout = () => {
    localStorage.clear(); // Limpa tudo
    navigate('/login');
  };

  return (
    <div className="layout-wrapper">
      {/* Barra Lateral */}
      <Sidebar />

      <div className="main-container">
        {/* --- BARRA SUPERIOR AZUL --- */}
        <header className="topbar">
           <div className="logo-area">
              <span className="brand-text">Bonita Fashion</span>
           </div>

           <div className="user-area" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>

              {/* Mostra Nome e Ícone */}
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem'}}>
                 <div style={{background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '50%'}}>
                    <User size={20} color="white" />
                 </div>
                 <div style={{display: 'flex', flexDirection: 'column', lineHeight: '1.1'}}>
                    <span style={{fontWeight: 'bold'}}>{nomeUsuario}</span>
                    <span style={{fontSize: '0.75rem', opacity: 0.8}}>{perfilUsuario === 'ADMIN' ? 'Administrador' : 'Vendedor'}</span>
                 </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout-header"
                title="Sair do sistema"
                style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '5px'}}
              >
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        {/* Conteúdo da Página */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;