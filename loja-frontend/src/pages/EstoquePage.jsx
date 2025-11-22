// Local: src/pages/EstoquePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal'; // 1. Importe o Modal
import toast from 'react-hot-toast'; // 2. Importe o Toast

Modal.setAppElement('#root');

function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]); // Precisa das categorias para o form
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // --- Estados do Modal de Edição ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '', precoVarejo: 0, precoAtacado: 0, precoCusto: 0,
    quantidadeEstoque: 0, categoriaId: ''
  });

  // --- Busca Inicial (Produtos e Categorias) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Agora buscamos categorias também, pois o formulário de edição precisa delas
      const [produtosRes, categoriasRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);
      setProdutos(produtosRes.data);
      setCategorias(categoriasRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Funções do Modal ---
  const abrirModalEdicao = (produto) => {
    setProdutoEmEdicao(produto);
    setFormData({
      nome: produto.nome,
      precoVarejo: produto.precoVarejo,
      precoAtacado: produto.precoAtacado,
      precoCusto: produto.precoCusto,
      quantidadeEstoque: produto.quantidadeEstoque,
      // Garante que pegamos o ID da categoria corretamente
      categoriaId: produto.categoria ? produto.categoria.id : ''
    });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setProdutoEmEdicao(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Salvar Edição ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepara o objeto para o Backend
    const payload = {
      ...formData,
      categoria: { id: parseInt(formData.categoriaId) }
    };
    delete payload.categoriaId;

    try {
      await api.put(`/produtos/${produtoEmEdicao.id}`, payload);
      toast.success('Produto atualizado com sucesso!');
      fecharModal();
      fetchData(); // Recarrega a lista para mostrar os dados novos
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro ao atualizar: ${errorMsg}`);
    }
  };

  // --- Filtro de Busca ---
  const produtosFiltrados = produtos.filter(produto => {
    const termo = termoBusca.toLowerCase();
    const nomeMatch = produto.nome.toLowerCase().includes(termo);
    const idMatch = produto.id.toString().includes(termo);
    return nomeMatch || idMatch;
  });

  if (loading) return <div>Carregando estoque...</div>;

  return (
    <div>
      <h2>Consulta de Estoque</h2>

      {/* Barra de Busca */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
          Buscar Produto (ID ou Nome):
        </label>
        <input
          type="text"
          placeholder="Digite para filtrar..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Tabela de Estoque */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'center' }}>Qtd. Atual</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th> {/* Nova Coluna */}
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map(prod => (
                <tr key={prod.id}>
                  <td>{prod.id}</td>
                  <td>{prod.nome}</td>
                  <td>{prod.categoria?.nome}</td>

                  {/* Qtd com destaque */}
                  <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
                    {prod.quantidadeEstoque}
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    {prod.quantidadeEstoque <= 5 ? (
                      <span style={{ color: '#dc3545', fontWeight: 'bold', backgroundColor: '#fadbd8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                        BAIXO
                      </span>
                    ) : (
                      <span style={{ color: '#28a745', fontWeight: 'bold', backgroundColor: '#d4edda', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                        OK
                      </span>
                    )}
                  </td>

                  {/* Botão de Editar */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => abrirModalEdicao(prod)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO (Reutilizando os estilos globais do App.css) --- */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={fecharModal}
        contentLabel="Editar Produto"
        overlayClassName="ModalOverlay"
        className="ModalContent"
        closeTimeoutMS={200}
      >
        <h2>Editar Produto</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required className="form-input" />
          </div>

          <div>
            <label className="form-label">Categoria:</label>
            <select name="categoriaId" value={formData.categoriaId} onChange={handleFormChange} className="form-select">
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantidade em Estoque:</label>
            <input
              type="number"
              name="quantidadeEstoque"
              value={formData.quantidadeEstoque}
              onChange={handleFormChange}
              className="form-input"
              style={{ border: '2px solid #2196f3', fontWeight: 'bold' }} // Destaque visual para o campo de estoque
            />
          </div>

          {/* Campos de Preço lado a lado */}
          <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{flex: 1}}>
                <label className="form-label">Custo:</label>
                <input type="number" name="precoCusto" step="0.01" value={formData.precoCusto} onChange={handleFormChange} className="form-input" />
             </div>
             <div style={{flex: 1}}>
                <label className="form-label">Varejo:</label>
                <input type="number" name="precoVarejo" step="0.01" value={formData.precoVarejo} onChange={handleFormChange} className="form-input" />
             </div>
             <div style={{flex: 1}}>
                <label className="form-label">Atacado:</label>
                <input type="number" name="precoAtacado" step="0.01" value={formData.precoAtacado} onChange={handleFormChange} className="form-input" />
             </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

export default EstoquePage;