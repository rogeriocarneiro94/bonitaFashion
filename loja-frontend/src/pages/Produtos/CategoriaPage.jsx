import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // <--- Import corrigido
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal'; // <--- Import corrigido
import { Edit, Trash2, Plus, Layers } from 'lucide-react';
import './ProdutoPage.css';

Modal.setAppElement('#root');

function CategoriaPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [idDelete, setIdDelete] = useState(null);
  const [nome, setNome] = useState('');

  const fetchCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
      setLoading(false);
    } catch (err) { toast.error('Erro ao carregar'); }
  };

  useEffect(() => { fetchCategorias(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id}`, { nome });
        toast.success('Atualizada!');
      } else {
        await api.post('/categorias', { nome });
        toast.success('Criada!');
      }
      setModalIsOpen(false);
      fetchCategorias();
    } catch (err) { toast.error('Erro ao salvar'); }
  };

  const deletar = async () => {
    try {
      await api.delete(`/categorias/${idDelete}`);
      toast.success('Excluída!');
      setCategorias(prev => prev.filter(c => c.id !== idDelete));
    } catch (err) { toast.error('Erro ao excluir'); }
    finally { setConfirmModalIsOpen(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Categorias</h2>
        <button className="btn-novo-topo" onClick={() => {setEditando(null); setNome(''); setModalIsOpen(true)}}>
           <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <div className="table-card" style={{maxWidth: '600px', margin: '0 auto'}}>
        <table className="custom-table">
          <thead>
            <tr>
              <th className="th-id">ID</th>
              <th>Nome da Categoria</th>
              <th className="th-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id}>
                <td className="td-id">#{cat.id}</td>
                <td><div style={{display:'flex', alignItems:'center', gap:'10px'}}><Layers size={16} color="#3498db"/> {cat.nome}</div></td>
                <td className="th-center actions-cell">
                   <button className="btn-icon" onClick={() => {setEditando(cat); setNome(cat.nome); setModalIsOpen(true)}}>
                      <Edit size={16} />
                   </button>
                   <button className="btn-icon delete" onClick={() => {setIdDelete(cat.id); setConfirmModalIsOpen(true)}}>
                      <Trash2 size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="ModalContent" overlayClassName="ModalOverlay">
         <h2>{editando ? 'Editar' : 'Nova'} Categoria</h2>
         <form onSubmit={salvar} className="form-modal">
            <label>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className="input-modal" autoFocus />
            <div className="modal-actions">
               <button type="button" className="btn-cancel" onClick={() => setModalIsOpen(false)}>Cancelar</button>
               <button type="submit" className="btn-confirm">Salvar</button>
            </div>
         </form>
      </Modal>

      <ConfirmationModal isOpen={confirmModalIsOpen} onClose={() => setConfirmModalIsOpen(false)} onConfirm={deletar} title="Excluir Categoria" message="Tem certeza?" />
    </div>
  );
}
export default CategoriaPage;