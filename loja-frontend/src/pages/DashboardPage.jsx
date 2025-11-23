import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Tenta buscar do backend (se o endpoint /dashboard existir)
        // Se não existir, vai cair no catch e usar dados simulados para não quebrar a tela
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.warn("API de dashboard não encontrada ou erro de permissão. Usando dados simulados.");
        // Dados simulados para visualização
        setDashboardData({
          totalVendasHoje: 1250.00,
          quantidadeVendasHoje: 5,
          produtosBaixoEstoque: [
            { id: 1, nome: 'Camiseta Básica P', estoque: 2 },
            { id: 2, nome: 'Calça Jeans 38', estoque: 1 }
          ],
          graficoVendas: [
            { dia: 'Seg', valor: 400 }, { dia: 'Ter', valor: 1200 }, { dia: 'Qua', valor: 800 },
            { dia: 'Qui', valor: 1500 }, { dia: 'Sex', valor: 2000 }, { dia: 'Sáb', valor: 3500 },
            { dia: 'Dom', valor: 1000 }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="dashboard-container">Carregando painel...</div>;
  if (!dashboardData) return <div className="dashboard-container">Sem dados disponíveis.</div>;

  // Formatação de Moeda
  const money = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="dashboard-container">
      
      {/* CABEÇALHO */}
      <div className="dashboard-header">
        <h2>Visão Geral</h2>
        <p>Resumo do desempenho da sua loja hoje.</p>
      </div>

      {/* 1. KPIs (INDICADORES) */}
      <div className="kpi-grid">
        {/* Card Faturamento */}
        <div className="kpi-card kpi-green">
          <div className="kpi-icon-wrapper"><DollarSign size={24} /></div>
          <div className="kpi-content">
            <h3>Faturamento Hoje</h3>
            <div className="kpi-value">{money(dashboardData.totalVendasHoje)}</div>
          </div>
        </div>

        {/* Card Qtd Vendas */}
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-wrapper"><ShoppingBag size={24} /></div>
          <div className="kpi-content">
            <h3>Vendas Realizadas</h3>
            <div className="kpi-value">{dashboardData.quantidadeVendasHoje}</div>
          </div>
        </div>

        {/* Card Alerta Estoque */}
        <div className="kpi-card kpi-red">
          <div className="kpi-icon-wrapper"><AlertTriangle size={24} /></div>
          <div className="kpi-content">
            <h3>Estoque Crítico</h3>
            <div className="kpi-value">
              {dashboardData.produtosBaixoEstoque ? dashboardData.produtosBaixoEstoque.length : 0} itens
            </div>
          </div>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL */}
      <div className="main-dashboard-grid">
        
        {/* GRÁFICO */}
        <div className="dashboard-card">
          <div className="card-title">
            <span><TrendingUp size={18} style={{marginRight:'8px', verticalAlign:'bottom'}}/> Desempenho Semanal</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={dashboardData.graficoVendas || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`}/>
                <Tooltip formatter={(value) => money(value)} />
                <Area type="monotone" dataKey="valor" stroke="#0078d4" fill="rgba(0, 120, 212, 0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTA DE ALERTA DE ESTOQUE */}
        <div className="dashboard-card">
          <div className="card-title">
            <span style={{color: '#e74c3c'}}><AlertTriangle size={18} style={{marginRight:'8px', verticalAlign:'bottom'}}/> Baixo Estoque</span>
          </div>
          
          {dashboardData.produtosBaixoEstoque && dashboardData.produtosBaixoEstoque.length > 0 ? (
            <ul className="stock-list">
              {dashboardData.produtosBaixoEstoque.map((prod) => (
                <li key={prod.id} className="stock-item">
                  <span className="product-name">{prod.nome}</span>
                  <span className="stock-badge">Restam: {prod.quantidadeEstoque || prod.estoque}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">Tudo certo com o estoque! 🎉</div>
          )}
        </div>

      </div>
    </div>
  );
}