// Local: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cores para o gráfico de Pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!stats) return null;

  // Dados fictícios para o gráfico de linha (para simular a imagem, já que não temos histórico mensal no backend ainda)
  const dadosGraficoLinha = [
    { name: 'Dia 1', vendas: 4000 }, { name: 'Dia 5', vendas: 3000 },
    { name: 'Dia 10', vendas: 2000 }, { name: 'Dia 15', vendas: 2780 },
    { name: 'Dia 20', vendas: 1890 }, { name: 'Dia 25', vendas: 2390 },
    { name: 'Dia 30', vendas: 3490 },
  ];

  // Transforma os dados do ranking para o gráfico de barras
  const dadosRanking = stats.rankingVendedores.map(v => ({
    name: v.nome,
    total: v.total
  }));

  return (
    <div>
      <div className="dashboard-header">
        <h2>Dashboard Vendas</h2>
      </div>

      <div className="dashboard-grid">

        {/* GRÁFICO DE ÁREA (Vendas Diário) - Ocupa 2 colunas se possível */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>Gráfico de Vendas Diário (Simulado)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGraficoLinha}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="vendas" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p><strong>Total Hoje: {stats.faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
        </div>

        {/* GRÁFICO DE PIZZA (Baixo Estoque) */}
        <div className="card">
          <h3>Produtos Críticos (Baixo Estoque)</h3>
          <div style={{ height: 300 }}>
             {/* Se não houver dados, mostre msg. Senão, mostre gráfico */}
             {stats.produtosBaixoEstoque.length === 0 ? <p>Estoque OK</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.produtosBaixoEstoque}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5} dataKey="quantidadeEstoque" nameKey="nome"
                    >
                      {stats.produtosBaixoEstoque.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             )}
          </div>
          <p>{stats.produtosBaixoEstoque.length} itens em alerta.</p>
        </div>

        {/* GRÁFICO DE BARRAS (Ranking Vendedores) */}
        <div className="card">
          <h3>Ranking Vendedores (Real)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosRanking}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;