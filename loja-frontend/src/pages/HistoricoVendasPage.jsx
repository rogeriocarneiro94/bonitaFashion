// Local: src/pages/HistoricoVendasPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

function HistoricoVendasPage() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/vendas');

        // --- A CORREÇÃO ESTÁ AQUI ---
        // 1. Verificamos se response.data é um array ANTES de tentar o .sort()
        if (Array.isArray(response.data)) {
          // 2. Ordena as vendas da mais recente para a mais antiga
          const vendasOrdenadas = response.data.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
          setVendas(vendasOrdenadas);
        } else {
          // Se não for um array, define como lista vazia
          setVendas([]);
          console.error("Erro: A API /vendas não retornou um array.", response.data);
        }

        setLoading(false);
      } catch (err) {
        const errorMsg = err.response ? (err.response.status === 403 ? "Você não tem permissão para ver o histórico." : err.response.data) : err.message;
        setError(errorMsg);
        // Não precisamos de um toast aqui, a mensagem de erro na tela é suficiente
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR'); // Formato: 16/11/2025 10:15:30
  };

  if (loading) return <div>Carregando histórico de vendas...</div>;

  // Se houver um erro, mostre o erro e pare
  if (error) return <div style={{ color: 'red' }}>Erro: {error}</div>;

  return (
    <div>
      <h2>Histórico de Vendas</h2>

      {/* Mensagem amigável se não houver vendas */}
      {vendas.length === 0 && !loading && (
        <p>Nenhuma venda registrada ainda.</p>
      )}

      <div className="vendas-lista">
        {vendas.map(venda => (
          <div key={venda.id} className="venda-card">
            <div className="venda-header">
              <strong>Venda ID: {venda.id}</strong>
              <span>Data: {formatarData(venda.dataHora)}</span>
            </div>
            <div className="venda-body">
              {/* Usamos o '?' (optional chaining) para evitar erros se os dados forem nulos */}
              <p><strong>Vendedor:</strong> {venda.funcionario?.nome || 'Não identificado'}</p>
              <p><strong>Cliente:</strong> {venda.cliente?.nome || 'Não identificado'}</p>
              <p><strong>Tipo:</strong> {venda.tipoVenda}</p>
              <p><strong>Pagamento:</strong> {venda.formaPagamento}</p>

              <h4>Itens Vendidos:</h4>
              <ul>
                {venda.itens?.map(item => (
                  <li key={item.id}>
                    {item.quantidade}x {item.produto?.nome || 'Produto não encontrado'}
                    (R$ {(item.precoUnitarioVenda || 0).toFixed(2)} cada)
                  </li>
                ))}
              </ul>
            </div>
            <div className="venda-footer">
              <strong>Total: R$ {(venda.valorTotal || 0).toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoricoVendasPage;