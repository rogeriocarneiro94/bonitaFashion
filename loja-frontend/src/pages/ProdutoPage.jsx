// Local: src/pages/ProdutoPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

// Estado inicial limpo
const formInicial = {
  nome: '',
  precoVarejo: '', // Usamos string vazia para o input ficar limpo
  precoAtacado: '',
  precoCusto: '',
  quantidadeEstoque: '',
  categoriaId: ''
};

function ProdutoPage() {
  const [formData, setFormData] = useState(formInicial);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Busca apenas as CATEGORIAS para preencher o dropdown ---
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        setCategorias(response.data);

        // Se houver categorias, seleciona a primeira por padrão
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, categoriaId: response.data[0].id }));
        }
        setLoading(false);
      } catch (err) {
        toast.error('Erro ao carregar categorias.');
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  // --- Handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Converte os valores numéricos antes de enviar
    const payload = {
      nome: formData.nome,
      precoVarejo: parseFloat(formData.precoVarejo),
      precoAtacado: parseFloat(formData.precoAtacado),
      precoCusto: parseFloat(formData.precoCusto),
      quantidadeEstoque: parseInt(formData.quantidadeEstoque),
      categoria: {
        id: parseInt(formData.categoriaId)
      }
    };

    try {
      await api.post('/produtos', payload);
      toast.success('Produto cadastrado com sucesso!');

      // Limpa o formulário mantendo a categoria selecionada
      setFormData({
        ...formInicial,
        categoriaId: formData.categoriaId
      });

    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      toast.error(`Erro ao cadastrar: ${errorMsg}`);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Cadastro de Produtos</h2>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          {/* Nome e Categoria na mesma linha */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Nome do Produto:</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleFormChange}
                required
                className="form-input"
                placeholder="Ex: Camiseta Básica"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Categoria:</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleFormChange}
                className="form-input"
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estoque */}
          <div className="form-group">
            <label className="form-label">Quantidade Inicial em Estoque:</label>
            <input
              type="number"
              name="quantidadeEstoque"
              value={formData.quantidadeEstoque}
              onChange={handleFormChange}
              required
              min="0"
              className="form-input"
              style={{ width: '150px' }}
            />
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
          <h4 style={{ marginTop: 0, color: '#666' }}>Preços</h4>

          {/* Preços em linha */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Preço de Custo (R$):</label>
              <input
                type="number"
                name="precoCusto"
                step="0.01"
                value={formData.precoCusto}
                onChange={handleFormChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Preço Atacado (R$):</label>
              <input
                type="number"
                name="precoAtacado"
                step="0.01"
                value={formData.precoAtacado}
                onChange={handleFormChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Preço Varejo (R$):</label>
              <input
                type="number"
                name="precoVarejo"
                step="0.01"
                value={formData.precoVarejo}
                onChange={handleFormChange}
                required
                className="form-input"
                style={{ borderColor: '#2196f3', borderWidth: '2px' }} // Destaque
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button type="submit" className="btn btn-success" style={{ padding: '12px 30px', fontSize: '1.1em' }}>
              Cadastrar Produto
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProdutoPage;