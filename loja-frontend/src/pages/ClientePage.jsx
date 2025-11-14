// Local: src/pages/ClientePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // Importa o modal de confirmação

Modal.setAppElement('#root');

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Modal de Formulário ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: ''
  });

  // --- Estados do Modal de Confirmação ---
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  // --- Função para buscar os dados ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
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
    setClienteEmEdicao(null);
    setFormData({ nome: '', cpfCnpj: '', telefone: '', email: '' });
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (cliente) => {
    setClienteEmEdicao(cliente);
    setFormData({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj,
      telefone: cliente.telefone,
      email: cliente.email
    });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setClienteEmEdicao(null);
  };

  // --- Função de mudança do formulário ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Função de Salvar (Criar ou Atualizar) ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const payload = formData;
    try {
      if (clienteEmEdicao) {
        await api.put(`/clientes/${clienteEmEdicao.id}`, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clientes', payload);
        toast.success('Cliente criado com sucesso!');
      }
      fecharModal();
      fetchData();
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro: ${errorMsg}`);
    }
  };

  // --- Funções de DELETAR (com modal de confirmação) ---
  const handleAbrirConfirmDelete = (clienteId) => {
    setClienteParaDeletar(clienteId);
    setConfirmModalIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${clienteParaDeletar}`);
      toast.success('Cliente excluído com sucesso!');

      setClientes(prevClientes =>
        prevClientes.filter(cliente => cliente.id !== clienteParaDeletar)
      );
    } catch (err)
    {
      const errorMsg = err.response ? (err.response.status === 403 ? "Você não tem permissão para excluir." : err.response.data) : err.message;
      toast.error('Erro ao excluir cliente: ' + errorMsg);
    } finally {
      setConfirmModalIsOpen(false);
      setClienteParaDeletar(null);
    }
  };


  // --- Renderização ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Clientes</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Cliente</button>

      {/* --- O Modal de Formulário --- */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={fecharModal}
        contentLabel="Formulário de Cliente"
        style={{
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            width: '400px'
          }
        }}
      >
        <h2>{clienteEmEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmitForm}>
          <div>
            <label>Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
          </div>
          <div>
            <label>CPF/CNPJ:</label>
            <input type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleFormChange} />
          </div>
          <div>
            <label>Telefone:</label>
            <input type="text" name="telefone" value={formData.telefone} onChange={handleFormChange} />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleFormChange} />
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
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />

      {/* --- Tabela de Clientes --- */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CPF/CNPJ</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.id}</td>
              <td>{cliente.nome}</td>
              <td>{cliente.cpfCnpj}</td>
              <td>{cliente.telefone}</td>
              <td>
                <button onClick={() => abrirModalEdicao(cliente)}>
                  Editar
                </button>
                <button
                  onClick={() => handleAbrirConfirmDelete(cliente.id)}
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

export default ClientePage;