import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  List,
  History,
  Layers
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(''); // 'vendas' ou 'produtos'
  const location = useLocation();

  // Função para alternar submenus
  const toggleSubmenu = (menuName) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenSubmenu(menuName);
    } else {
      setOpenSubmenu(openSubmenu === menuName ? '' : menuName);
    }
  };

  // Verifica se um link está ativo para pintar de azul
  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (paths) => paths.some(p => location.pathname.startsWith(p));

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

        <nav>
          <ul>
            {/* DASHBOARD */}
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon"><LayoutDashboard size={20} /></span>
                <span className="link-text">Início</span>
              </NavLink>
            </li>

            {/* MENU VENDAS (Com Submenu) */}
            <li>
              <div
                className={`sidebar-link ${isSubmenuActive(['/vendas', '/historico-vendas']) ? 'active' : ''}`}
                onClick={() => toggleSubmenu('vendas')}
              >
                <span className="link-icon"><ShoppingCart size={20} /></span>
                <span className="link-text">Vendas</span>
                {!collapsed && <ChevronDown size={16} style={{marginLeft:'auto', transform: openSubmenu === 'vendas' ? 'rotate(180deg)' : 'rotate(0)'}} />}
              </div>

              {/* Itens do Submenu */}
              {openSubmenu === 'vendas' && !collapsed && (
                <div className="submenu">
                  <NavLink to="/vendas" className="submenu-link">
                    <Plus size={16} style={{marginRight:'8px'}}/> Nova Venda
                  </NavLink>
                  <NavLink to="/historico-vendas" className="submenu-link">
                    <History size={16} style={{marginRight:'8px'}}/> Histórico
                  </NavLink>
                </div>
              )}
            </li>

            {/* MENU PRODUTOS (Com Submenu) */}
            <li>
              <div
                className={`sidebar-link ${isSubmenuActive(['/produtos', '/estoque', '/categorias']) ? 'active' : ''}`}
                onClick={() => toggleSubmenu('produtos')}
              >
                <span className="link-icon"><Package size={20} /></span>
                <span className="link-text">Produtos</span>
                {!collapsed && <ChevronDown size={16} style={{marginLeft:'auto', transform: openSubmenu === 'produtos' ? 'rotate(180deg)' : 'rotate(0)'}} />}
              </div>

              {openSubmenu === 'produtos' && !collapsed && (
                <div className="submenu">
                  <NavLink to="/estoque" className="submenu-link">
                    <List size={16} style={{marginRight:'8px'}}/> Estoque
                  </NavLink>
                  <NavLink to="/produtos/novo" className="submenu-link">
                    <Plus size={16} style={{marginRight:'8px'}}/> Cadastrar
                  </NavLink>
                  <NavLink to="/categorias" className="submenu-link">
                    <Layers size={16} style={{marginRight:'8px'}}/> Categorias
                  </NavLink>
                </div>
              )}
            </li>

            {/* CLIENTES */}
            <li>
              <NavLink to="/clientes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon"><Users size={20} /></span>
                <span className="link-text">Clientes</span>
              </NavLink>
            </li>

            {/* FUNCIONÁRIOS */}
            <li>
              <NavLink to="/funcionarios" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon"><Briefcase size={20} /></span>
                <span className="link-text">Funcionários</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Botão de Recolher na parte inferior */}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;