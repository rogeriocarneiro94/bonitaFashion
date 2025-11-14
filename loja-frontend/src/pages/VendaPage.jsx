// Local: src/pages/VendaPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';

function VendaPage() {
  // Estados do formulário principal
  const [clienteId, setClienteId] = useState('');
  const [tipoVenda, setTipoVenda] = useState('VAREJO');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  // Estados da busca
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);

  // Estado do Carrinho
  const [itensCarrinho, setItensCarrinho] = useState([]);

  // Estados de Feedback
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Efeito "Live Search" (como antes) ---
  useEffect(() => {
    if (termoBusca.length < 2) {
      setResultadosBusca([]);
      return;
    }
    const timerId = setTimeout(() => {
      const buscar = async () => {
        try {
          const response = await api.get(`/produtos/buscar?nome=${termoBusca}`);
          setResultadosBusca(response.data);
        } catch (err) {
          console.error("Erro ao buscar produtos:", err);
        }
      };
      buscar();
    }, 300);
    return () => {
      clearTimeout(timerId);
    };
  }, [termoBusca]);

  // --- LÓGICA DO CARRINHO (Atualizada) ---

  const adicionarAoCarrinho = (produto) => {
    // Verifica se o item já está no carrinho
    const itemExistente = itensCarrinho.find(item => item.produtoId === produto.id);

    if (itemExistente) {
      // Se existe, apenas incrementa a quantidade
      setItensCarrinho(prevItens =>
        prevItens.map(item =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      // Se não existe, adiciona o novo item com quantidade 1
      const precoUnitario = tipoVenda === 'VAREJO' ? produto.precoVarejo : produto.precoAtacado;
      const novoItem = {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: 1, // Começa com 1
        precoUnitario: precoUnitario,
        estoqueMax: produto.quantidadeEstoque
      };
      setItensCarrinho(prevItens => [...prevItens, novoItem]);
    }

    // Limpa a busca
    setResultadosBusca([]);
    setTermoBusca('');
  };

  const handleAtualizarQuantidadeCarrinho = (produtoId, novaQuantidade) => {
    const qtd = parseInt(novaQuantidade);
    setItensCarrinho(prevItens =>
      prevItens.map(item =>
        item.produtoId === produtoId ? { ...item, quantidade: qtd } : item
      )
    );
  };

  const handleRemoverDoCarrinho = (produtoId) => {
    setItensCarrinho(prevItens =>
      prevItens.filter(item => item.produtoId !== produtoId)
    );
  };

  // --- LÓGICA DA VENDA (sem mudança) ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (itensCarrinho.length === 0) {
      setError("Adicione pelo menos um item à venda.");
      return;
    }
    const itensParaEnviar = itensCarrinho.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade
    }));
    const vendaRequest = {
      clienteId: clienteId ? parseInt(clienteId) : null,
      tipoVenda: tipoVenda,
      formaPagamento: formaPagamento,
      itens: itensParaEnviar
    };
    try {
      const response = await api.post('/vendas', vendaRequest);
      setSuccess('Venda realizada com sucesso! ID: ' + response.data.id);
      setItensCarrinho([]);
      setClienteId('');
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    }
  };

  // --- CÁLCULO DO TOTAL (sem mudança) ---
  const totalCarrinho = itensCarrinho.reduce((total, item) => {
    return total + (item.precoUnitario * item.quantidade);
  }, 0);

  return (
    <div>
      <h2>Registrar Nova Venda (PDV)</h2>

      {error && <div style={{ color: 'red' }}>Erro: {error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}

      {/* --- MUDANÇA: SEÇÃO DE BUSCA DE PRODUTO --- */}
      {/* 1. Adicionamos o 'search-container' para o CSS funcionar */}
      <div className="search-container">
        <h3>Buscar Produto</h3>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Digite o nome do produto..."
          style={{ width: '100%' }} // Faz o input usar a largura do container
        />

        {/* 2. Os resultados agora usam a classe CSS 'search-results' */}
        {resultadosBusca.length > 0 && (
          <ul className="search-results">
            {resultadosBusca.map(prod => (
              <li key={prod.id} onClick={() => adicionarAoCarrinho(prod)}>
                {prod.nome} (Estoque: {prod.quantidadeEstoque})
                {/* 3. Removemos o input de quantidade e o botão daqui */}
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {/* --- FORMULÁRIO PRINCIPAL DA VENDA --- */}
      <form onSubmit={handleSubmit}>
        {/* ... (campos Cliente, Tipo Venda, Forma Pagamento) ... */}

        {/* --- MUDANÇA: SEÇÃO DO CARRINHO --- */}
        <h3>Carrinho de Venda</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensCarrinho.map((item, index) => (
              <tr key={index}>
                <td>{item.nome}</td>
                <td>
                  {/* 4. Input de quantidade agora está DENTRO do carrinho */}
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleAtualizarQuantidadeCarrinho(item.produtoId, e.target.value)}
                    min={1}
                    max={item.estoqueMax} // Impede vender mais que o estoque
                    style={{ width: '60px' }}
                  />
                </td>
                <td>R$ {item.precoUnitario}</td>
                <td>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                <td>
                  {/* 5. Botão para remover o item */}
                  <button
                    type="button"
                    onClick={() => handleRemoverDoCarrinho(item.produtoId)}
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Total: R$ {totalCarrinho.toFixed(2)}</h4>

        <button type="submit">Finalizar Venda</button>
      </form>
    </div>
  );
}

export default VendaPage;