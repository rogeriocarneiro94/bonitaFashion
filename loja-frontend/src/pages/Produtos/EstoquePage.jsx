import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Search, Edit, Trash2, X, Package, AlertCircle } from 'lucide-react';
import './ProdutoPage.css'; // Mesmo CSS para manter padrão

Modal.setAppElement('#root');

function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  const [formData, setFormData] = useState({
    nome: '', precoVarejo: '', precoAtacado: '', precoCusto: '', quantidadeEstoque: '', categoriaId: ''
  });

  // --- CARGA DE DADOS ---
  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);
      setProdutos(prodRes.data.sort((a,b) => b.id - a.id));
      setCategorias(catRes.data);
      setLoading(false);
    } catch (err) { toast.error('Erro ao carregar estoque'); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const abrirEdicao = (prod) => {
    setProdutoEmEdicao(prod);
    setFormData({
      nome: prod.nome,
      precoVarejo: prod.precoVarejo,
      precoAtacado: prod.precoAtacado,
      precoCusto: prod.precoCusto,
      quantidadeEstoque: prod.quantidadeEstoque,
      categoriaId: prod.categoria?.id || ''
    });
    setModalIsOpen(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    const payload = { ...formData, categoria: { id: parseInt(formData.categoriaId) } };
    delete payload.categoriaId;

    try {
      await api.put(`/produtos/${produtoEmEdicao.id}`, payload);
      toast.success('Atualizado!');
      setModalIsOpen(false);
      fetchData();
    } catch (err) { toast.error('Erro ao atualizar.'); }
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/produtos/${idParaDeletar}`);
      toast.success('Excluído!');
      setProdutos(prev => prev.filter(p => p.id !== idParaDeletar));
    } catch (err) { toast.error('Erro ao excluir.'); }
    finally { setConfirmModalIsOpen(false); }
  };

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.id.toString().includes(termoBusca)
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gerenciar Estoque</h2>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="search-bar-container">
        <div className="search-input-box">
           <Search size={20} color="#999" />
           <input
              placeholder="Buscar por nome ou ID..."
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
           />
           {termoBusca && <button onClick={() => setTermoBusca('')}><X size={16}/></button>}
        </div>
      </div>

      {/* TABELA DE ESTOQUE */}
      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="th-id">ID</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th className="th-center">Estoque</th>
              <th className="th-right">Preço Varejo</th>
              <th className="th-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="td-id">#{p.id}</td>
                <td><strong>{p.nome}</strong></td>
                <td><span className="badge-cat">{p.categoria?.nome}</span></td>
                <td className="th-center">
                   {p.quantidadeEstoque <= 5 ? (
                     <span className="badge-estoque danger">{p.quantidadeEstoque} (Baixo)</span>
                   ) : (
                     <span className="badge-estoque success">{p.quantidadeEstoque}</span>
                   )}
                </td>
                <td className="th-right">R$ {p.precoVarejo.toFixed(2)}</td>
                <td className="th-center actions-cell">
                   <button className="btn-icon edit" onClick={() => abrirEdicao(p)} title="Editar">
                      <Edit size={16} />
                   </button>
                   <button className="btn-icon delete" onClick={() => {setIdParaDeletar(p.id); setConfirmModalIsOpen(true)}} title="Excluir">
                      <Trash2 size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIÇÃO */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="ModalContent" overlayClassName="ModalOverlay">
         <h2>Editar Produto</h2>
         <form onSubmit={salvarEdicao} className="form-modal">
            <label>Nome</label>
            <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="input-modal" />

            <div className="row-modal">
                <div>
                   <label>Categoria</label>
                   <select value={formData.categoriaId} onChange={e => setFormData({...formData, categoriaId: e.target.value})} className="input-modal">
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                </div>
                <div>
                   <label>Estoque</label>
                   <input type="number" value={formData.quantidadeEstoque} onChange={e => setFormData({...formData, quantidadeEstoque: e.target.value})} className="input-modal" />
                </div>
            </div>

            <div className="row-modal">
               <div><label>Custo</label><input type="number" step="0.01" value={formData.precoCusto} onChange={e => setFormData({...formData, precoCusto: e.target.value})} className="input-modal"/></div>
               <div><label>Atacado</label><input type="number" step="0.01" value={formData.precoAtacado} onChange={e => setFormData({...formData, precoAtacado: e.target.value})} className="input-modal"/></div>
               <div><label>Varejo</label><input type="number" step="0.01" value={formData.precoVarejo} onChange={e => setFormData({...formData, precoVarejo: e.target.value})} className="input-modal"/></div>
            </div>

            <div className="modal-actions">
               <button type="button" className="btn-cancel" onClick={() => setModalIsOpen(false)}>Cancelar</button>
               <button type="submit" className="btn-confirm">Salvar</button>
            </div>
         </form>
      </Modal>

      <ConfirmationModal isOpen={confirmModalIsOpen} onClose={() => setConfirmModalIsOpen(false)} onConfirm={confirmarExclusao} title="Excluir Produto" message="Tem certeza? O histórico será mantido." />
    </div>
  );
}

export default EstoquePage;