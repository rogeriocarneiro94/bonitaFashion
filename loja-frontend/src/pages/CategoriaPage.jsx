// Local: src/pages/CategoriaPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { modalStyles } from '../components/modalStyles';

Modal.setAppElement('#root');

function CategoriaPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Modal ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null);
  const [formData, setFormData] = useState({ nome: '' });

  // --- Estados do Modal de Confirmação ---
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState(null);

  // --- Funções de busca e modal ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categorias');
      // AQUI ESTÁ A CORREÇÃO:
      // Nós apenas salvamos os dados, sem tentar usar .sort()
      setCategorias(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const abrirModalNovo = () => {
    setCategoriaEmEdicao(null);
    setFormData({ nome: '' });
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (categoria) => {
    setCategoriaEmEdicao(categoria);
    setFormData({ nome: categoria.nome });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setCategoriaEmEdicao(null);
  };

  const handleFormChange = (e) => {
    setFormData({ nome: e.target.value });
  };

  // --- Função de Salvar ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const payload = formData;
    try {
      if (categoriaEmEdicao) {
        await api.put(`/categorias/${categoriaEmEdicao.id}`, payload);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categorias', payload);
        toast.success('Categoria criada com sucesso!');
      }
      fecharModal();
      fetchData();
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro: ${errorMsg}`);
    }
  };

  // --- Funções de Deletar ---
  const handleAbrirConfirmDelete = (categoriaId) => {
    setCategoriaParaDeletar(categoriaId);
    setConfirmModalIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/categorias/${categoriaParaDeletar}`);
      toast.success('Categoria excluída com sucesso!');
      setCategorias(prev => prev.filter(cat => cat.id !== categoriaParaDeletar));
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error('Erro ao excluir categoria: ' + errorMsg);
    } finally {
      setConfirmModalIsOpen(false);
      setCategoriaParaDeletar(null);
    }
  };

  // --- Renderização ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro ao buscar categorias: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Categorias</h2>
      <button onClick={abrirModalNovo}>Adicionar Nova Categoria</button>

      {/* --- Modal de Formulário --- */}
      <Modal
              isOpen={modalIsOpen}
              onRequestClose={fecharModal}
              contentLabel="Formulário..."
              overlayClassName="ModalOverlay" // <-- ADICIONE ISTO
              className="ModalContent"        // <-- ADICIONE ISTO
              closeTimeoutMS={200} // Tempo da animação de saída
            >
        <h2>{categoriaEmEdicao ? 'Editar Categoria' : 'Nova Categoria'}</h2>
        <form onSubmit={handleSubmitForm}>
          <div>
            <label>Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
          </div>
          <br/>
          <button type="submit">Salvar</button>
          <button type="button" onClick={fecharModal}>Cancelar</button>
        </form>
      </Modal>

      {/* --- Modal de Confirmação --- */}
      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
      />

      {/* --- Tabela --- */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(categoria => (
            <tr key={categoria.id}>
              <td>{categoria.id}</td>
              <td>{categoria.nome}</td>
              <td>
                <button onClick={() => abrirModalEdicao(categoria)}>
                  Editar
                </button>
                <button
                  onClick={() => handleAbrirConfirmDelete(categoria.id)}
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

export default CategoriaPage;