// Local: src/components/Layout.jsx

import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
// Adicionei 'FileText' e 'Shield' para os novos itens
import {
  Home, ShoppingCart, Package, Users, UserCircle, Menu, ChevronDown, ChevronRight, FileText, Shield
} 
from 'lucide-react';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const location = useLocation();

  // --- 1. LÓGICA DO TÍTULO DA PÁGINA ---
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/relatorios': return 'Relatórios Gerenciais';
      case '/vendas': return 'PDV - Nova Venda';
      case '/historico-vendas': return 'Histórico de Vendas';
      case '/produtos': return 'Cadastro de Produtos';
      case '/estoque': return 'Consulta de Estoque';
      case '/categorias': return 'Categorias de Produtos';
      case '/clientes': return 'Cadastro de Clientes';
      case '/funcionarios': return 'Cadastro de Funcionários';
      case '/permissoes': return 'Configuração de Permissões';
      default: return '';
    }
  };

  const currentTitle = getPageTitle(location.pathname);

  // --- 2. NOVA ESTRUTURA DO MENU ---
  const menuStructure = [
    {
      type: 'group',
      title: 'Início',
      icon: <Home size={20} />,
      children: [
        { title: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      type: 'group',
      title: 'Relatórios',
      icon: <FileText size={20} />,
      children: [
        { title: 'Não foi desenvolvido', path: '/dashboard' }
      ]
    },
    {
      type: 'group',
      title: 'Vendas',
      icon: <ShoppingCart size={20} />,
      children: [
        { title: 'Nova Venda', path: '/vendas' },
        { title: 'Histórico de Vendas', path: '/historico-vendas' }
      ]
    },
    {
      type: 'group',
      title: 'Produtos',
      icon: <Package size={20} />,
      children: [
        { title: 'Cadastro de Produtos', path: '/produtos' },
        { title: 'Estoque', path: '/estoque' },
        { title: 'Categorias', path: '/categorias' }
      ]
    },
    {
      type: 'group',
      title: 'Clientes',
      icon: <Users size={20} />,
      children: [
        { title: 'Cadastro de Clientes', path: '/clientes' }
      ]
    },
    {
      type: 'group',
      title: 'Funcionários',
      icon: <UserCircle size={20} />,
      children: [
        { title: 'Cadastro de Funcionários', path: '/funcionarios' },
        { title: 'Configurar Permissão', path: '/permissoes', icon: <Shield size={16}/> }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleSubmenu = (title) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setExpandedMenu(title);
    } else {
      setExpandedMenu(expandedMenu === title ? null : title);
    }
  };

  const isLinkActive = (path) => location.pathname === path;

  // Verifica se um grupo deve estar aberto (se a rota atual está dentro dele)
  const isGroupActive = (children) => {
    return children.some(child => location.pathname === child.path);
  };

  return (
    <div className="layout-wrapper">

      {/* --- HEADER AZUL --- */}
      <header className="topbar">
        <div className="logo-area">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>

          <span className="brand-text">Bonita Fashion</span>

          <span className="title-separator">|</span>
          <span className="page-title">{currentTitle}</span>
        </div>

        <div className="user-area">
          <UserCircle size={24} />
          <span className="user-name">Admin</span>
          <button onClick={handleLogout} className="btn-logout-header">Sair</button>
        </div>
      </header>

      <div className="main-container">
        {/* --- SIDEBAR --- */}
        <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>

          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="sidebar-toggle">
            {isSidebarOpen ? '‹' : '›'}
          </button>

          <nav>
            <ul>
              {menuStructure.map((item, index) => (
                <li key={index}>
                  {item.type === 'link' ? (
                    <Link to={item.path} className={`sidebar-link ${isLinkActive(item.path) ? 'active' : ''}`}>
                      <span className="link-icon">{item.icon}</span>
                      <span className="link-text">{item.title}</span>
                    </Link>
                  ) : (
                    <>
                      <div
                        className={`sidebar-group-title ${expandedMenu === item.title || isGroupActive(item.children) ? 'active-group' : ''}`}
                        onClick={() => toggleSubmenu(item.title)}
                      >
                        <div style={{display:'flex', alignItems:'center'}}>
                          <span className="link-icon">{item.icon}</span>
                          <span className="link-text">{item.title}</span>
                        </div>
                        {isSidebarOpen && (
                          <span className="chevron">
                            {expandedMenu === item.title ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                          </span>
                        )}
                      </div>
                      {/* Renderiza sub-menu se estiver aberto */}
                      {expandedMenu === item.title && isSidebarOpen && (
                        <ul className="submenu">
                          {item.children.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link to={subItem.path} className={`submenu-link ${isLinkActive(subItem.path) ? 'active' : ''}`}>
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* --- CONTEÚDO --- */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;