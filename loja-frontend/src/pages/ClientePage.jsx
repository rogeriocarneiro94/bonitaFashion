// Local: src/pages/ClientePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';

// Configuração do Modal (fora do componente)
Modal.setAppElement('#root');

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para o Modal e Formulário ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: ''
  });

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

  // --- Funções para controlar o Modal ---

  const abrirModalNovo = () => {
    setClienteEmEdicao(null);
    setFormData({ // Limpa o formulário
      nome: '',
      cpfCnpj: '',
      telefone: '',
      email: ''
    });
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (cliente) => {
    setClienteEmEdicao(cliente);
    setFormData({ // Preenche o formulário com dados do cliente
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

  // --- Funções de Formulário ---

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // O payload é simples, idêntico ao formData
    const payload = formData;

    try {
      if (clienteEmEdicao) {
        // Modo de ATUALIZAÇÃO (PUT)
        await api.put(`/clientes/${clienteEmEdicao.id}`, payload);
        alert('Cliente atualizado com sucesso!');
      } else {
        // Modo de CRIAÇÃO (POST)
        await api.post('/clientes', payload);
        alert('Cliente criado com sucesso!');
      }
      fecharModal();
      fetchData(); // Atualiza a lista na tela

    } catch (err) {
      // Pega o erro do backend (ex: "CPF/CNPJ já cadastrado")
      const errorMsg = err.response ? err.response.data : err.message;
      alert(`Erro: ${errorMsg}`);
    }
  };

  // --- Função DELETAR ---

  const handleDelete = async (clienteId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }
    try {
      // (Lembre-se que só Gerente pode deletar, então isso vai falhar se logado como Vendedor)
      await api.delete(`/clientes/${clienteId}`);
      alert('Cliente excluído com sucesso!');
      // Atualiza a lista na tela
      setClientes(prevClientes =>
        prevClientes.filter(cliente => cliente.id !== clienteId)
      );
    } catch (err) {
      const errorMsg = err.response ? (err.response.status === 403 ? "Você não tem permissão para excluir." : err.response.data) : err.message;
      alert('Erro ao excluir cliente: ' + errorMsg);
    }
  };

  // --- Renderização ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Clientes</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Cliente</button>

      {/* --- O Modal de Cliente --- */}
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
                  onClick={() => handleDelete(cliente.id)}
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