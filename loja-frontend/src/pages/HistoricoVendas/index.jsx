import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './styles.css';
import { Eye, Search, Calendar, Filter } from 'lucide-react';

export default function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [vendasFiltradas, setVendasFiltradas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    data: '',
    cliente: '',
    tipo: '',
    pagamento: ''
  });

  useEffect(() => {
    async function loadVendas() {
      try {
        const response = await api.get('/vendas');
        // Ordenação segura
        const dados = response.data || [];
        const ordenadas = dados.sort((a, b) => b.id - a.id);
        setVendas(ordenadas);
        setVendasFiltradas(ordenadas);
      } catch (error) {
        console.error("Erro ao buscar histórico", error);
      } finally {
        setLoading(false);
      }
    }
    loadVendas();
  }, []);

  useEffect(() => {
    const filtrar = () => {
      const result = vendas.filter(venda => {
        const matchData = filtros.data ? venda.dataHora.startsWith(filtros.data) : true;
        const nomeCliente = venda.cliente?.nome || 'Consumidor Final';
        const matchCliente = nomeCliente.toLowerCase().includes(filtros.cliente.toLowerCase());
        const matchTipo = filtros.tipo ? venda.tipoVenda === filtros.tipo : true;
        const matchPagamento = filtros.pagamento
            ? venda.formaPagamento.toLowerCase().includes(filtros.pagamento.toLowerCase())
            : true;

        return matchData && matchCliente && matchTipo && matchPagamento;
      });
      setVendasFiltradas(result);
    };
    filtrar();
  }, [filtros, vendas]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('pt-BR');

  return (
    <div className="historico-container">
      <div className="historico-header">
        <h2>Histórico de Vendas</h2>
      </div>

      <div className="filtros-bar">
        <div className="filtro-group">
            <Calendar size={16} className="filtro-icon" />
            <input
                type="date"
                value={filtros.data}
                onChange={e => handleFiltroChange('data', e.target.value)}
                className="filtro-input"
            />
        </div>

        <div className="filtro-group flex-grow">
            <Search size={16} className="filtro-icon" />
            <input
                type="text"
                placeholder="Filtrar por Cliente..."
                value={filtros.cliente}
                onChange={e => handleFiltroChange('cliente', e.target.value)}
                className="filtro-input"
            />
        </div>

        <div className="filtro-group">
            <Filter size={16} className="filtro-icon" />
            <select
                value={filtros.tipo}
                onChange={e => handleFiltroChange('tipo', e.target.value)}
                className="filtro-select"
            >
                <option value="">Todos os Tipos</option>
                <option value="VAREJO">Varejo</option>
                <option value="ATACADO">Atacado</option>
            </select>
        </div>

        <div className="filtro-group">
            <input
                type="text"
                placeholder="Forma Pagto..."
                value={filtros.pagamento}
                onChange={e => handleFiltroChange('pagamento', e.target.value)}
                className="filtro-input"
            />
        </div>

        {(filtros.data || filtros.cliente || filtros.tipo || filtros.pagamento) && (
            <button
                className="btn-limpar"
                onClick={() => setFiltros({ data: '', cliente: '', tipo: '', pagamento: '' })}
            >
                Limpar
            </button>
        )}
      </div>

      <div style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
         Mostrando <strong>{vendasFiltradas.length}</strong> de {vendas.length} registros
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="table-container">
          <table className="vendas-table">
            <thead>
              <tr>
                <th className="col-id">#ID</th>
                <th>Data / Hora</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Tipo</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th className="col-acoes">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda) => (
                <tr key={venda.id}>
                  <td className="col-id">{venda.id}</td>
                  <td>{formatDate(venda.dataHora)}</td>
                  <td>
                    {venda.cliente ? <strong>{venda.cliente.nome}</strong> : <span style={{color: '#999'}}>Consumidor Final</span>}
                  </td>
                  <td>{venda.funcionario?.nome || 'Admin'}</td>
                  <td>
                    <span className={`badge ${venda.tipoVenda === 'ATACADO' ? 'badge-atacado' : 'badge-varejo'}`}>
                      {venda.tipoVenda}
                    </span>
                  </td>
                  <td>{venda.formaPagamento}</td>
                  <td className="col-total">{formatMoney(venda.valorTotal)}</td>

                  <td className="col-acoes">
                    {/* --- AQUI ESTÁ A CORREÇÃO PRINCIPAL --- */}
                    <button
                      className="btn-detalhes"
                      onClick={() => setVendaSelecionada(venda)}
                      title="Ver Detalhes"
                    >
                      <Eye size={18}/>
                    </button>
                    {/* -------------------------------------- */}
                  </td>
                </tr>
              ))}
              {vendasFiltradas.length === 0 && (
                  <tr>
                      <td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                          Nenhuma venda encontrada com esses filtros.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {vendaSelecionada && (
        <div className="modal-overlay" onClick={() => setVendaSelecionada(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes da Venda #{vendaSelecionada.id}</h3>
              <button className="modal-close" onClick={() => setVendaSelecionada(null)}>×</button>
            </div>

            <div style={{ marginBottom: '15px' }}>
               <p><strong>Cliente:</strong> {vendaSelecionada.cliente?.nome || 'Não identificado'}</p>
               <p><strong>Data:</strong> {formatDate(vendaSelecionada.dataHora)}</p>
            </div>

            <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Itens Vendidos</h4>
            <ul className="lista-itens">
              {vendaSelecionada.itens.map((item, idx) => (
                <li key={idx} className="item-row">
                  <span>
                    <strong>{item.quantidade}x</strong> {item.produto?.nome || 'Produto'}
                  </span>
                  <span>{formatMoney(item.precoUnitarioVenda * item.quantidade)}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '1.2rem', color: '#27ae60', fontWeight: 'bold' }}>
              Total Final: {formatMoney(vendaSelecionada.valorTotal)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}