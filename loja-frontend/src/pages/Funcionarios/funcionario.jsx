import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Users, UserPlus, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';
import './Funcionario.css';

Modal.setAppElement('#root');

const formInicial = { nome: '', login: '', senha: '', perfil: 'USER', dataAdmissao: '' };

function Funcionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  // Form
  const [formData, setFormData] = useState(formInicial);

  // --- CARREGAR LISTA ---
  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Erro ao carregar funcionários.');
      setLoading(false);
    }
  };

  useEffect(() => { fetchFuncionarios(); }, []);

  // --- HANDLERS ---
  const abrirModalNovo = () => {
    setFuncionarioEmEdicao(null);
    setFormData(formInicial);
    setModalIsOpen(true);
  };

  const abrirModalEdicao = (func) => {
      setFuncionarioEmEdicao(func);
      setFormData({
          nome: func.nome,
          login: func.login,
          senha: '',
          perfil: func.perfil || 'USER',
          dataAdmissao: func.dataAdmissao // <--- Carrega a data vinda do banco
      });
      setModalIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Se for edição e a senha estiver vazia, remove do payload para não sobrescrever com vazio
    const payload = { ...formData };
    if (funcionarioEmEdicao && !payload.senha) {
        delete payload.senha;
    }

    try {
      if (funcionarioEmEdicao) {
        await api.put(`/funcionarios/${funcionarioEmEdicao.id}`, payload);
        toast.success('Funcionário atualizado!');
      } else {
        if(!payload.senha) return toast.error("Senha é obrigatória para novos usuários");
        await api.post('/funcionarios', payload);
        toast.success('Funcionário criado!');
      }
      setModalIsOpen(false);
      fetchFuncionarios();
    } catch (err) {
      const msg = err.response?.data || 'Erro ao salvar';
      toast.error(msg);
    }
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/funcionarios/${idParaDeletar}`);
      toast.success('Funcionário excluído!');
      setFuncionarios(prev => prev.filter(f => f.id !== idParaDeletar));
    } catch (err) { toast.error('Erro ao excluir.'); }
    finally { setConfirmModalIsOpen(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Funcionários</h2>
        <button className="btn-novo-topo" onClick={abrirModalNovo}>
           <UserPlus size={18} /> Novo Funcionário
        </button>
      </div>

      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th>Nome</th>
              <th>Login / Acesso</th>
              <th className="th-center">Perfil</th>
              <th className="th-center col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(func => (
              <tr key={func.id}>
                <td className="col-id">#{func.id}</td>
                <td>
                    <div style={{fontWeight: 'bold', color: '#2c3e50'}}>{func.nome}</div>
                </td>
                <td>{func.login}</td>
                <td className="th-center">
                   {func.perfil === 'ADMIN' ? (
                       <span className="badge-role badge-admin"><ShieldCheck size={12} style={{verticalAlign:'text-top'}}/> Admin</span>
                   ) : (
                       <span className="badge-role badge-user"><Users size={12} style={{verticalAlign:'text-top'}}/> Vendedor</span>
                   )}
                </td>
                <td className="actions-cell">
                   <button className="btn-icon" onClick={() => abrirModalEdicao(func)} title="Editar">
                      <Edit size={16} />
                   </button>
                   <button className="btn-icon delete" onClick={() => {setIdParaDeletar(func.id); setConfirmModalIsOpen(true)}} title="Excluir">
                      <Trash2 size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CADASTRO/EDIÇÃO --- */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="ModalContent" overlayClassName="ModalOverlay">
         <div className="modal-header">
            <h3>{funcionarioEmEdicao ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
         </div>

         <form onSubmit={handleSave} className="form-modal">
            <div className="form-group">
                <label>Nome Completo</label>
                <input
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    required
                    placeholder="Ex: João da Silva"
                />
            </div>

            <div className="form-group">
                <label>Login (Usuário)</label>
                <input
                    value={formData.login}
                    onChange={e => setFormData({...formData, login: e.target.value})}
                    required
                    disabled={!!funcionarioEmEdicao} // Geralmente não se muda o login, mas pode remover se quiser
                />
            </div>

            <div className="form-group">
                <label>Senha {funcionarioEmEdicao && <small>(Deixe em branco para manter a atual)</small>}</label>
                <input
                    type="password"
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    placeholder="******"
                />
            </div>

            <div className="form-group">
                <label>Data de Admissão</label>
                <input
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={e => setFormData({...formData, dataAdmissao: e.target.value})}
                    required // Obrigatório pois o banco exige
                />
            </div>

            <div className="modal-actions">
               <button type="button" className="btn-cancel" onClick={() => setModalIsOpen(false)}>Cancelar</button>
               <button type="submit" className="btn-confirm">Salvar</button>
            </div>
         </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Funcionário"
        message="Tem certeza? O acesso será revogado imediatamente."
      />
    </div>
  );
}

export default Funcionario;