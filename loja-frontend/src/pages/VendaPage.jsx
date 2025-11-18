// Local: src/pages/VendaPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

function VendaPage() {
  // --- Estados da Venda ---
  const [tipoVenda, setTipoVenda] = useState('VAREJO');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  // --- Estados do Carrinho ---
  const [itensCarrinho, setItensCarrinho] = useState([]);

  // --- Estados da Busca de Produto ---
  const [termoBuscaProduto, setTermoBuscaProduto] = useState('');
  const [resultadosBuscaProduto, setResultadosBuscaProduto] = useState([]);

  // --- Estados: Busca de Cliente ---
  const [termoBuscaCliente, setTermoBuscaCliente] = useState('');
  const [resultadosBuscaCliente, setResultadosBuscaCliente] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null); // Guarda o objeto do cliente

  // --- Efeito "Live Search" para PRODUTOS ---
  useEffect(() => {
    if (termoBuscaProduto.length < 2) {
      setResultadosBuscaProduto([]);
      return;
    }
    const timerId = setTimeout(() => {
      const buscar = async () => {
        try {
          const response = await api.get(`/produtos/buscar?nome=${termoBuscaProduto}`);
          setResultadosBuscaProduto(response.data);
        } catch (err) { console.error("Erro ao buscar produtos:", err); }
      };
      buscar();
    }, 300);
    return () => clearTimeout(timerId);
  }, [termoBuscaProduto]);

  // --- EFEITO: "Live Search" para CLIENTES ---
  useEffect(() => {
    if (termoBuscaCliente.length < 2) {
      setResultadosBuscaCliente([]);
      return;
    }
    const timerId = setTimeout(() => {
      const buscar = async () => {
        try {
          const response = await api.get(`/clientes/buscar?nome=${termoBuscaCliente}`);
          setResultadosBuscaCliente(response.data);
        } catch (err) { console.error("Erro ao buscar clientes:", err); }
      };
      buscar();
    }, 300);
    return () => clearTimeout(timerId);
  }, [termoBuscaCliente]);

  // --- LÓGICA DO CARRINHO ---
  const adicionarAoCarrinho = (produto) => {
    const itemExistente = itensCarrinho.find(item => item.produtoId === produto.id);

    if (itemExistente) {
      setItensCarrinho(prevItens =>
        prevItens.map(item =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      const precoUnitario = tipoVenda === 'VAREJO' ? produto.precoVarejo : produto.precoAtacado;
      const novoItem = {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: 1,
        precoUnitario: precoUnitario,
        estoqueMax: produto.quantidadeEstoque
      };
      setItensCarrinho(prevItens => [...prevItens, novoItem]);
    }
    setResultadosBuscaProduto([]);
    setTermoBuscaProduto('');
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

  // --- LÓGICA DA VENDA ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (itensCarrinho.length === 0) {
      toast.error("Adicione pelo menos um item à venda.");
      return;
    }
    const itensParaEnviar = itensCarrinho.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade
    }));

    const vendaRequest = {
      clienteId: clienteSelecionado ? clienteSelecionado.id : null,
      tipoVenda: tipoVenda,
      formaPagamento: formaPagamento,
      itens: itensParaEnviar
    };

    try {
      const response = await api.post('/vendas', vendaRequest);
      toast.success(`Venda #${response.data.id} realizada com sucesso!`);
      // Limpa tudo
      setItensCarrinho([]);
      setClienteSelecionado(null);
      setTermoBuscaCliente('');
      setFormaPagamento('Dinheiro');
      setTipoVenda('VAREJO');
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro ao finalizar venda: ${errorMsg}`);
    }
  };

  // --- CÁLCULO DO TOTAL ---
  const totalCarrinho = itensCarrinho.reduce((total, item) => {
    return total + (item.precoUnitario * item.quantidade);
  }, 0);

  return (
    <div>
      <h2>Registrar Nova Venda (PDV)</h2>

      <form onSubmit={handleSubmit}>

        {/* --- SEÇÃO DE CLIENTE --- */}
        <div>
          <h3>Cliente</h3>
          {!clienteSelecionado ? (
            <div className="search-container">
              <input
                type="text"
                value={termoBuscaCliente}
                onChange={(e) => setTermoBuscaCliente(e.target.value)}
                placeholder="Digite o nome ou CPF do cliente..."
                style={{ width: '100%' }}
              />
              {resultadosBuscaCliente.length > 0 && (
                <ul className="search-results">
                  {resultadosBuscaCliente.map(cli => (
                    <li key={cli.id} onClick={() => {
                      setClienteSelecionado(cli);
                      setResultadosBuscaCliente([]);
                      setTermoBuscaCliente('');
                    }}>
                      {cli.nome} - ({cli.cpfCnpj})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}><b>Cliente:</b> {clienteSelecionado.nome}</p>
              <button type="button" onClick={() => setClienteSelecionado(null)} style={{backgroundColor: '#6c757d'}}>
                Remover
              </button>
            </div>
          )}
        </div>

        <hr />

        {/* --- SEÇÃO DE BUSCA DE PRODUTO --- */}
        <div className="search-container">
          <h3>Buscar Produto</h3>
          <input
            type="text"
            value={termoBuscaProduto}
            onChange={(e) => setTermoBuscaProduto(e.target.value)}
            placeholder="Digite o nome do produto..."
            style={{ width: '100%' }}
          />
          {resultadosBuscaProduto.length > 0 && (
            <ul className="search-results">
              {resultadosBuscaProduto.map(prod => (
                <li key={prod.id} onClick={() => adicionarAoCarrinho(prod)}>
                  {prod.nome} (Estoque: {prod.quantidadeEstoque})
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr />

        {/* --- SEÇÃO DO CARRINHO --- */}
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
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleAtualizarQuantidadeCarrinho(item.produtoId, e.target.value)}
                    min={1}
                    max={item.estoqueMax}
                    style={{ width: '60px' }}
                  />
                </td>
                <td>R$ {item.precoUnitario}</td>
                <td>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                <td>
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

        {/* --- CAMPOS FINAIS (Tipo de Venda, Pagamento) --- */}
        <div style={{ marginTop: '20px' }}>
          <label>Tipo de Venda: </label>
          <select value={tipoVenda} onChange={(e) => setTipoVenda(e.target.value)}>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
          </select>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Forma de Pagamento: </label>
          <input
            type="text"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          />
        </div>

        <button type="submit" style={{ marginTop: '20px', padding: '15px', fontSize: '1.2em' }}>
          Finalizar Venda
        </button>
      </form>
    </div>
  );
}

export default VendaPage;