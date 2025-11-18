// Local: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Chama o nosso novo endpoint do backend
        const response = await api.get('/dashboard');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Carregando dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro ao carregar o dashboard: {error}</div>;
  if (!stats) return null; // Retorno caso os stats ainda sejam nulos

  // Helper para formatar moeda
  const formatarMoeda = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div>
      <h1>Dashboard Principal</h1>
      <p>Bem-vindo ao sistema de gestão Bonita Fashion!</p>

      <hr />

      <div className="dashboard-grid">

        {/* Card 2: Vendas do Dia */}
        <div className="dashboard-card">
          <h3>Vendas do Dia</h3>
          <p className="stat-big">{stats.numeroVendasHoje}</p>
          <p>Total faturado hoje: <strong>{formatarMoeda(stats.faturamentoHoje)}</strong></p>
        </div>

        {/* Card 1: Ranking de Vendedores */}
        <div className="dashboard-card">
          <h3>Ranking de Vendedores (Geral)</h3>
          <ul>
            {stats.rankingVendedores.length === 0 ? (
              <li>Nenhuma venda registrada</li>
            ) : (
              stats.rankingVendedores.map((v, index) => (
                <li key={index}>
                  <span>{index + 1}. {v.nome}</span>
                  <span>{formatarMoeda(v.total)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Card 3: Produtos com Baixo Estoque */}
        <div className="dashboard-card">
          <h3>Produtos com Baixo Estoque (Menos de 10)</h3>
          <ul>
            {stats.produtosBaixoEstoque.length === 0 ? (
              <li>Nenhum produto com baixo estoque</li>
            ) : (
              stats.produtosBaixoEstoque.map(p => (
                <li key={p.id}>
                  <span>{p.nome}</span>
                  <span className="low-stock-item">{p.quantidadeEstoque} un.</span>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;