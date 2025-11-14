// Local: src/pages/ProdutoPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // Importa o modal de confirmação

Modal.setAppElement('#root');

function ProdutoPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o Modal de Formulário ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    precoVarejo: 0,
    precoAtacado: 0,
    precoCusto: 0,
    quantidadeEstoque: 0,
    categoriaId: ''
  });

  // --- Estados para o Modal de Confirmação ---
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  // --- Função para buscar os dados iniciais (Produtos E Categorias) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [produtosRes, categoriasRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);

      setProdutos(produtosRes.data);
      setCategorias(categoriasRes.data);

      if (categoriasRes.data.length > 0 && !formData.categoriaId) {
        setFormData(prev => ({ ...prev, categoriaId: categoriasRes.data[0].id }));
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Roda a busca de dados quando a página carrega
  useEffect(() => {
    fetchData();
  }, []);

  // --- Funções para controlar o Modal de Formulário ---
  const abrirModalNovo = () => {
    setProdutoEmEdicao(null);
    setFormData({
      nome: '', precoVarejo: 0, precoAtacado: 0, precoCusto: 0,
      quantidadeEstoque: 0, categoriaId: categorias.length > 0 ? categorias[0].id : ''
    });
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (produto) => {
    setProdutoEmEdicao(produto);
    setFormData({
      nome: produto.nome,
      precoVarejo: produto.precoVarejo,
      precoAtacado: produto.precoAtacado,
      precoCusto: produto.precoCusto,
      quantidadeEstoque: produto.quantidadeEstoque,
      categoriaId: produto.categoria.id
    });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setProdutoEmEdicao(null);
  };

  // --- Função para lidar com mudanças no formulário ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Função para ENVIAR o novo produto (Criar ou Atualizar) ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoria: { id: parseInt(formData.categoriaId) }
    };
    delete payload.categoriaId;

    try {
      if (produtoEmEdicao) {
        await api.put(`/produtos/${produtoEmEdicao.id}`, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', payload);
        toast.success('Produto criado com sucesso!');
      }
      fecharModal();
      fetchData(); // Atualiza a lista
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro: ${errorMsg}`);
    }
  };

  // --- Funções de DELETAR (com modal de confirmação) ---
  const handleAbrirConfirmDelete = (produtoId) => {
    setProdutoParaDeletar(produtoId);
    setConfirmModalIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/produtos/${produtoParaDeletar}`);
      toast.success('Produto excluído com sucesso!');
      setProdutos(prevProdutos =>
        prevProdutos.filter(produto => produto.id !== produtoParaDeletar)
      );
    } catch (err) {
      toast.error('Erro ao excluir produto: ' + (err.response ? err.response.data : err.message));
    } finally {
      setConfirmModalIsOpen(false);
      setProdutoParaDeletar(null);
    }
  };

  // --- Renderização da Página ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Produtos</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Produto</button>

      {/* --- O Modal de Formulário --- */}
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
          {/* ... (inputs do formulário) ... */}
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

      {/* --- O Modal de Confirmação --- */}
      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />

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
                  onClick={() => handleAbrirConfirmDelete(produto.id)}
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