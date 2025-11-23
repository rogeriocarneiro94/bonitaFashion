import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Package, DollarSign, Save, Layers, Archive } from 'lucide-react';
import './ProdutoPage.css'; // Usaremos o mesmo CSS padronizado

const formInicial = {
  nome: '',
  precoVarejo: '',
  precoAtacado: '',
  precoCusto: '',
  quantidadeEstoque: '',
  categoriaId: ''
};

function ProdutoPage() {
  const [formData, setFormData] = useState(formInicial);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        setCategorias(response.data);
        if (response.data.length > 0) {
           setFormData(prev => ({ ...prev, categoriaId: response.data[0].id }));
        }
      } catch (err) { toast.error('Erro ao carregar categorias.'); }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nome: formData.nome,
      precoVarejo: parseFloat(formData.precoVarejo),
      precoAtacado: parseFloat(formData.precoAtacado),
      precoCusto: parseFloat(formData.precoCusto),
      quantidadeEstoque: parseInt(formData.quantidadeEstoque),
      categoria: { id: parseInt(formData.categoriaId) }
    };

    try {
      await api.post('/produtos', payload);
      toast.success('Produto cadastrado com sucesso!');
      setFormData(prev => ({ ...formInicial, categoriaId: prev.categoriaId }));
    } catch (err) {
      toast.error('Erro ao cadastrar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cadastro de Produtos</h2>
      </div>

      <div className="form-wrapper-center">
        <form onSubmit={handleSubmit}>

          {/* CARD 1: DADOS BÁSICOS */}
          <div className="form-card">
            <div className="card-header">
               <Package size={20} className="card-icon"/> <h3>Dados do Produto</h3>
            </div>

            <div className="row">
               <div className="col-2">
                  <label>Nome do Produto *</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: Camiseta Polo" autoFocus />
               </div>
               <div className="col-1">
                  <label>Categoria</label>
                  <div className="select-wrapper">
                    <select name="categoriaId" value={formData.categoriaId} onChange={handleChange}>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="row">
               <div className="col-1">
                  <div className="input-icon-wrapper">
                      <label>Estoque</label>
                    <input type="number" name="quantidadeEstoque" value={formData.quantidadeEstoque} onChange={handleChange} required placeholder="0" />
                  </div>
               </div>
               <div className="col-2"></div> {/* Espaço vazio para alinhar */}
            </div>
          </div>

          {/* CARD 2: PREÇOS */}
          <div className="form-card mt-20">
             <div className="card-header">
               <DollarSign size={20} className="card-icon"/> <h3>Preço</h3>
             </div>

             <div className="row">
                <div className="col-1">
                   <label>Custo (R$)</label>
                   <input type="number" step="0.01" name="precoCusto" value={formData.precoCusto} onChange={handleChange} required placeholder="0.00" />
                </div>
                <div className="col-1">
                   <label>Atacado (R$)</label>
                   <input type="number" step="0.01" name="precoAtacado" value={formData.precoAtacado} onChange={handleChange} required placeholder="0.00" />
                </div>
                <div className="col-1">
                   <label>Varejo (R$)</label>
                   <input
                      type="number" step="0.01" name="precoVarejo"
                      value={formData.precoVarejo} onChange={handleChange} required
                      placeholder="0.00"
                      className="input-destaque"
                   />
                </div>
             </div>
          </div>

          <div className="form-actions">
             <button type="submit" className="btn-save" disabled={loading}>
                <Save size={18} /> {loading ? 'Salvando...' : 'Cadastrar Produto'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProdutoPage;