// Local: src/pages/ProdutoPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function ProdutoPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o Modal ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // 'produtoEmEdicao' guarda o produto que está sendo editado (ou null se for novo)
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  // 'formData' guarda os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    precoVarejo: 0,
    precoAtacado: 0,
    precoCusto: 0,
    quantidadeEstoque: 0,
    categoriaId: ''
  });

  // --- Função para buscar os dados iniciais ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [produtosRes, categoriasRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);
      setProdutos(produtosRes.data);
      setCategorias(categoriasRes.data);
      if (categoriasRes.data.length > 0) {
        setFormData(prev => ({ ...prev, categoriaId: categoriasRes.data[0].id }));
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Funções para controlar o Modal ---

  // 1. Abre o modal para CRIAR um novo produto
  const abrirModalNovo = () => {
    setProdutoEmEdicao(null); // Limpa o estado de edição
    // Reseta o formulário para valores padrão
    setFormData({
      nome: '',
      precoVarejo: 0,
      precoAtacado: 0,
      precoCusto: 0,
      quantidadeEstoque: 0,
      categoriaId: categorias.length > 0 ? categorias[0].id : ''
    });
    setModalIsOpen(true);
  };

  // 2. Abre o modal para EDITAR um produto existente
  const abrirModalEdicao = (produto) => {
    setProdutoEmEdicao(produto); // Guarda o produto que estamos editando
    // Preenche o formulário com os dados do produto
    setFormData({
      nome: produto.nome,
      precoVarejo: produto.precoVarejo,
      precoAtacado: produto.precoAtacado,
      precoCusto: produto.precoCusto,
      quantidadeEstoque: produto.quantidadeEstoque,
      categoriaId: produto.categoria.id // Pega o ID da categoria do produto
    });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setProdutoEmEdicao(null); // Limpa o estado de edição ao fechar
  };

  // --- Função para lidar com mudanças no formulário ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Função para ENVIAR (Criar OU Atualizar) ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      categoria: {
        id: parseInt(formData.categoriaId)
      }
    };
    delete payload.categoriaId;

    try {
      if (produtoEmEdicao) {
        // --- Modo de ATUALIZAÇÃO (PUT) ---
        await api.put(`/produtos/${produtoEmEdicao.id}`, payload);
        alert('Produto atualizado com sucesso!');
      } else {
        // --- Modo de CRIAÇÃO (POST) ---
        await api.post('/produtos', payload);
        alert('Produto criado com sucesso!');
      }

      fecharModal();
      fetchData(); // Atualiza a lista na tela

    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      alert(`Erro: ${errorMsg}`);
    }
  };

  // --- Função DELETAR (como antes) ---
  const handleDelete = async (produtoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    try {
      await api.delete(`/produtos/${produtoId}`);
      alert('Produto excluído com sucesso!');
      setProdutos(prevProdutos =>
        prevProdutos.filter(produto => produto.id !== produtoId)
      );
    } catch (err) {
      alert('Erro ao excluir produto: ' + (err.response ? err.response.data : err.message));
    }
  };

  // --- Renderização ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Produtos</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Produto</button>

      {/* --- O Modal (agora genérico) --- */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={fecharModal}
        contentLabel="Formulário de Produto"
        style={{
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            width: '400px'
          }
        }}
      >
        <h2>{produtoEmEdicao ? 'Editar Produto' : 'Novo Produto'}</h2>
        <form onSubmit={handleSubmitForm}>
          <div>
            <label>Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
          </div>
          <div>
            <label>Categoria:</label>
            <select name="categoriaId" value={formData.categoriaId} onChange={handleFormChange}>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Estoque:</label>
            <input type="number" name="quantidadeEstoque" value={formData.quantidadeEstoque} onChange={handleFormChange} />
          </div>
          <div>
            <label>Preço Custo:</label>
            <input type="number" name="precoCusto" step="0.01" value={formData.precoCusto} onChange={handleFormChange} />
          </div>
           <div>
            <label>Preço Atacado:</label>
            <input type="number" name="precoAtacado" step="0.01" value={formData.precoAtacado} onChange={handleFormChange} />
          </div>
           <div>
            <label>Preço Varejo:</label>
            <input type="number" name="precoVarejo" step="0.01" value={formData.precoVarejo} onChange={handleFormChange} />
          </div>
          <br/>
          <button type="submit">Salvar</button>
          <button type="button" onClick={fecharModal}>Cancelar</button>
        </form>
      </Modal>

      {/* --- Tabela de Produtos --- */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Estoque</th>
            <th>Preço (Varejo)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{produto.quantidadeEstoque}</td>
              <td>R$ {produto.precoVarejo}</td>
              <td>
                <button onClick={() => abrirModalEdicao(produto)}>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(produto.id)}
                  style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProdutoPage;