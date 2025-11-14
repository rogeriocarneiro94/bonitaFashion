// Local: src/pages/FuncionarioPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast'; // 1. IMPORTE O TOAST
import ConfirmationModal from '../components/ConfirmationModal'; // 2. IMPORTE O MODAL DE CONFIRMAÇÃO

Modal.setAppElement('#root');

function FuncionarioPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Modal de Formulário ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cargo: 'VENDEDOR',
    login: '',
    senha: ''
  });

  // 3. NOVOS ESTADOS PARA O MODAL DE CONFIRMAÇÃO
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);

  // --- Funções de busca e modal de formulário (sem mudança) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
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
    setFuncionarioEmEdicao(null);
    setFormData({ nome: '', cpf: '', cargo: 'VENDEDOR', login: '', senha: '' });
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (funcionario) => {
    setFuncionarioEmEdicao(funcionario);
    setFormData({
      nome: funcionario.nome,
      cpf: funcionario.cpf,
      cargo: funcionario.cargo,
      login: funcionario.login,
      senha: '' // Senha não é editada
    });
    setModalIsOpen(true);
  };

  const fecharModal = () => {
    setModalIsOpen(false);
    setFuncionarioEmEdicao(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (funcionarioEmEdicao) {
      delete payload.senha;
    }

    try {
      if (funcionarioEmEdicao) {
        // (Ainda não implementamos a ATUALIZAÇÃO no backend, vamos focar na criação)
        toast.error('Atualização de funcionário ainda não implementada.');
      } else {
        await api.post('/funcionarios', payload);
        toast.success('Funcionário criado com sucesso!'); // 4. SUBSTITUÍDO POR TOAST
      }
      fecharModal();
      fetchData();
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro: ${errorMsg}`); // 4. SUBSTITUÍDO POR TOAST
    }
  };

  // --- FUNÇÕES DE DELETAR (Modificadas) ---

  // 5. Esta função AGORA SÓ ABRE o modal de confirmação
  const handleAbrirConfirmDelete = (funcionarioId) => {
    setFuncionarioParaDeletar(funcionarioId);
    setConfirmModalIsOpen(true);
  };

  // 6. Esta é a função que o MODAL chama ao confirmar
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/funcionarios/${funcionarioParaDeletar}`);
      toast.success('Funcionário excluído com sucesso!'); // 4. SUBSTITUÍDO POR TOAST

      setFuncionarios(prev =>
        prev.filter(f => f.id !== funcionarioParaDeletar)
      );
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error('Erro ao excluir funcionário: ' + errorMsg); // 4. SUBSTITUÍDO POR TOAST
    } finally {
      setConfirmModalIsOpen(false);
      setFuncionarioParaDeletar(null);
    }
  };

  // --- Renderização ---
  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro ao buscar funcionários: Você não tem permissão para ver esta página.</div>;

  return (
    <div>
      <h2>Gerenciamento de Funcionários</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Funcionário</button>

      {/* --- O Modal de Formulário (sem mudança) --- */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={fecharModal}
        contentLabel="Formulário de Funcionário"
        style={{ /* ...seus estilos do modal... */ }}
      >
        <h2>{funcionarioEmEdicao ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
        <form onSubmit={handleSubmitForm}>
          <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome" required />
          <input type="text" name="cpf" value={formData.cpf} onChange={handleFormChange} placeholder="CPF" required />
          <select name="cargo" value={formData.cargo} onChange={handleFormChange}>
            <option value="VENDEDOR">Vendedor</option>
            <option value="GERENTE">Gerente</option>
          </select>
          <input type="text" name="login" value={formData.login} onChange={handleFormChange} placeholder="Login" required />
          {!funcionarioEmEdicao && (
             <input type="password" name="senha" value={formData.senha} onChange={handleFormChange} placeholder="Senha" required />
          )}
          <br/><button type="submit">Salvar</button>
          <button type="button" onClick={fecharModal}>Cancelar</button>
        </form>
      </Modal>

      {/* 7. ADICIONE O NOVO MODAL DE CONFIRMAÇÃO AQUI */}
      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
      />

      {/* --- Tabela --- */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Login</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.login}</td>
              <td>
                <button onClick={() => abrirModalEdicao(f)}>Editar</button>
                <button
                  // 8. O onClick agora chama a função de ABRIR o modal
                  onClick={() => handleAbrirConfirmDelete(f.id)}
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

export default FuncionarioPage;