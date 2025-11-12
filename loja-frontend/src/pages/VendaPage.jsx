// Local: src/pages/VendaPage.jsx

import React, { useState } from 'react';
import api from '../api/api';

function VendaPage() {
  // Estados para o formulário principal
  const [clienteId, setClienteId] = useState('');
  const [tipoVenda, setTipoVenda] = useState('VAREJO');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  // --- Novos Estados para a busca e carrinho ---
  const [termoBusca, setTermoBusca] = useState('');     // O que o usuário digita para buscar
  const [resultadosBusca, setResultadosBusca] = useState([]); // A lista de produtos encontrados
  const [itensCarrinho, setItensCarrinho] = useState([]);      // O "carrinho" da venda atual
  const [quantidadeItem, setQuantidadeItem] = useState(1);     // Quantidade padrão para adicionar

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Nova Função: Buscar Produtos ---
  const handleBuscarProduto = async () => {
    if (termoBusca.length < 2) {
      setResultadosBusca([]);
      return;
    }
    try {
      const response = await api.get(`/produtos/buscar?nome=${termoBusca}`);
      setResultadosBusca(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Erro ao buscar produtos.");
    }
  };

  // --- Nova Função: Adicionar ao Carrinho ---
  const adicionarAoCarrinho = (produto) => {
    const item = {
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: parseInt(quantidadeItem),
      precoUnitario: tipoVenda === 'VAREJO' ? produto.precoVarejo : produto.precoAtacado,
    };

    // Adiciona o novo item à lista existente no carrinho
    setItensCarrinho(prevItens => [...prevItens, item]);

    // Limpa a busca
    setResultadosBusca([]);
    setTermoBusca('');
    setQuantidadeItem(1);
  };

  // --- Função Principal: Finalizar a Venda ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (itensCarrinho.length === 0) {
      setError("Adicione pelo menos um item à venda.");
      return;
    }

    // Mapeia o carrinho para o formato que o DTO do backend espera
    const itensParaEnviar = itensCarrinho.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade
    }));

    const vendaRequest = {
      clienteId: clienteId ? parseInt(clienteId) : null,
      tipoVenda: tipoVenda,
      formaPagamento: formaPagamento,
      itens: itensParaEnviar // Usa a lista dinâmica
    };

    try {
      const response = await api.post('/vendas', vendaRequest);
      setSuccess('Venda realizada com sucesso! ID: ' + response.data.id);
      // Limpa tudo após a venda
      setItensCarrinho([]);
      setClienteId('');

    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    }
  };

  // Calcula o total do carrinho em tempo real
  const totalCarrinho = itensCarrinho.reduce((total, item) => {
    return total + (item.precoUnitario * item.quantidade);
  }, 0);

  return (
    <div>
      <h2>Registrar Nova Venda (PDV)</h2>

      {error && <div style={{ color: 'red' }}>Erro: {error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}

      {/* --- SEÇÃO DE BUSCA DE PRODUTO --- */}
      <div>
        <h3>Buscar Produto</h3>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Digite o nome do produto..."
        />
        <button type="button" onClick={handleBuscarProduto}>Buscar</button>
      </div>

      {/* --- SEÇÃO DE RESULTADOS DA BUSCA --- */}
      {resultadosBusca.length > 0 && (
        <div>
          <h4>Resultados da Busca:</h4>
          <ul>
            {resultadosBusca.map(prod => (
              <li key={prod.id}>
                {prod.nome} (Estoque: {prod.quantidadeEstoque})
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={prod.quantidadeEstoque}
                  onChange={(e) => setQuantidadeItem(e.target.value)}
                  style={{ width: '50px', marginLeft: '10px' }}
                />
                <button type="button" onClick={() => adicionarAoCarrinho(prod)}>Adicionar</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr />

      {/* --- FORMULÁRIO PRINCIPAL DA VENDA --- */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID do Cliente (opcional):</label>
          <input type="number" value={clienteId} onChange={(e) => setClienteId(e.target.value)} />
        </div>
        <div>
          <label>Tipo de Venda:</label>
          <select value={tipoVenda} onChange={(e) => setTipoVenda(e.target.value)}>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
          </select>
        </div>
        <div>
          <label>Forma de Pagamento:</label>
          <input type="text" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} />
        </div>

        {/* --- SEÇÃO DO CARRINHO --- */}
        <h3>Carrinho de Venda</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itensCarrinho.map((item, index) => (
              <tr key={index}>
                <td>{item.nome}</td>
                <td>{item.quantidade}</td>
                <td>R$ {item.precoUnitario}</td>
                <td>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
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