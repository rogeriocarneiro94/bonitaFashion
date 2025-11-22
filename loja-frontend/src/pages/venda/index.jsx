import React, { useEffect } from 'react';
import { useVenda } from './hooks/useVenda';

// Componentes
import GridItensVenda from './components/GridItensVenda';
import ClienteSearch from './components/ClienteSearch';
import ProdutoSearch from './components/ProdutoSearch';

// Estilos Novos
import './styles.css';

export default function VendaPage() {
  const { venda, actions, totalGeral, loading } = useVenda();

  // --- ATALHOS DE TECLADO (Mantive igual) ---
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === 'F2') { e.preventDefault(); document.getElementById('buscaProduto')?.focus(); }
      if (e.key === 'F3') { e.preventDefault(); document.getElementById('buscaCliente')?.focus(); }
      if (e.key === 'F5') { e.preventDefault(); actions.finalizarVenda(); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [actions]);

  return (
    <div className="venda-container">

      {/* --- NOVA BARRA DE FERRAMENTAS SUPERIOR --- */}
      {/* Removemos o <h1> e juntamos tudo aqui */}
      <header className="venda-toolbar">

        {/* Grupo 1: Cliente (Flex-grow para ocupar espaço) */}
        <div className="toolbar-group flex-grow">
            <label className="toolbar-label">Cliente (F3)</label>
            <ClienteSearch
                selected={venda.cliente}
                onSelect={actions.selecionarCliente}
            />
        </div>

        {/* Grupo 2: Tipo de Venda (Fixo) */}
        <div className="toolbar-group" style={{ minWidth: '150px' }}>
            <label className="toolbar-label">Tipo Tabela</label>
            <select
                value={venda.tipoVenda}
                onChange={(e) => actions.mudarTipoVenda(e.target.value)}
            >
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
            </select>
        </div>

        {/* Grupo 3: Produto (Flex-grow para ocupar espaço) */}
        <div className="toolbar-group flex-grow">
             <label className="toolbar-label">Buscar Produto (F2)</label>
             <ProdutoSearch onAdd={actions.adicionarItem} />
        </div>

      </header>

      {/* --- CORPO DA VENDA (GRID) --- */}
      <main className="venda-body">
        <GridItensVenda
          itens={venda.itens}
          onUpdateItem={actions.atualizarItem}
          onRemoveItem={actions.removerItem}
        />
      </main>

      {/* --- RODAPÉ (FOOTER) --- */}
      <footer className="venda-footer">
        <div className="footer-info">
          <div className="info-group">
            <label>Pagamento</label>
            <input
              value={venda.formaPagamento}
              onChange={e => actions.setVenda({...venda, formaPagamento: e.target.value})}
              className="input-pagamento-footer"
            />
          </div>
          <div className="info-group">
            <label>Total a Pagar</label>
            <div className="total-valor">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
            </div>
          </div>
        </div>

        <button
          className="btn-finalizar"
          onClick={actions.finalizarVenda}
          disabled={loading}
          title="Atalho: F5"
        >
          {loading ? 'Processando...' : 'FINALIZAR VENDA (F5)'}
        </button>
      </footer>
    </div>
  );
}