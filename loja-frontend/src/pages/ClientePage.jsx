// Local: src/pages/ClientePage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

// Objeto inicial seguro
const formInicial = {
  id: '',
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  tipoPessoa: 'PF'
};

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário e Busca
  const [formData, setFormData] = useState(formInicial);
  const [termoBusca, setTermoBusca] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Modal de Exclusão
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  // --- MÁSCARAS MANUAIS (Seguras) ---
  const formatarGenerico = (v) => v ? v : '';

  const mascaraCPF = (v) => {
    return v.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mascaraCNPJ = (v) => {
    return v.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mascaraTelefone = (v) => {
    let r = v.replace(/\D/g, "");
    if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    return r;
  };

  const mascaraCEP = (v) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substr(0, 9);


  // --- API: Buscar Lista ---
  const fetchData = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data || []); // Garante array
      setLoading(false);
    } catch (err) {
      toast.error('Erro ao carregar lista.');
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- BUSCA POR ID (Enter no campo ID) ---
  const buscarPorId = async () => {
    if (!formData.id) return;
    try {
      const res = await api.get(`/clientes/${formData.id}`);
      preencherFormulario(res.data);
      toast.success('Cliente encontrado!');
    } catch (err) {
      toast.error('Cliente não encontrado. Iniciando novo.');
      limparFormulario();
    }
  };

  const handleIdKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarPorId();
    }
  };

  // --- PREENCHIMENTO ---
  const preencherFormulario = (cliente) => {
    const docLimpo = (cliente.cpfCnpj || '').replace(/\D/g, '');
    const tipo = docLimpo.length > 11 ? 'PJ' : 'PF';

    setFormData({
      id: cliente.id,
      nome: cliente.nome || '',
      cpfCnpj: tipo === 'PF' ? mascaraCPF(cliente.cpfCnpj || '') : mascaraCNPJ(cliente.cpfCnpj || ''),
      telefone: mascaraTelefone(cliente.telefone || ''),
      email: cliente.email || '',
      cep: mascaraCEP(cliente.cep || ''),
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      uf: cliente.uf || '',
      tipoPessoa: tipo
    });
  };

  const limparFormulario = () => {
    setFormData(formInicial);
  };

  // --- HANDLERS DE INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    // Aplica máscaras
    if (name === 'cpfCnpj') val = formData.tipoPessoa === 'PF' ? mascaraCPF(value) : mascaraCNPJ(value);
    if (name === 'telefone') val = mascaraTelefone(value);
    if (name === 'cep') {
      val = mascaraCEP(value);
      if (val.replace(/\D/g, '').length === 8) buscarCEP(val);
    }

    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleTipoChange = (tipo) => {
    setFormData(prev => ({ ...prev, tipoPessoa: tipo, cpfCnpj: '' }));
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro, bairro: data.bairro,
          cidade: data.localidade, uf: data.uf, complemento: data.complemento || prev.complemento
        }));
        toast.success('Endereço preenchido!');
      }
    } catch (e) { toast.error('Erro no CEP'); }
    finally { setBuscandoCep(false); }
  };

  // --- SALVAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Payload limpo
    const payload = {
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      cep: formData.cep.replace(/\D/g, '')
    };
    delete payload.tipoPessoa; // Não envia para o backend

    try {
      if (formData.id && clientes.some(c => c.id === formData.id)) {
        // Se tem ID e ele existe na lista, é atualização
        await api.put(`/clientes/${formData.id}`, payload);
        toast.success('Atualizado com sucesso!');
      } else {
        // Se não, é criação (remove ID para o banco gerar)
        delete payload.id;
        const res = await api.post('/clientes', payload);
        toast.success(`Criado! ID: ${res.data.id}`);
        // Atualiza o ID no form
        setFormData(prev => ({ ...prev, id: res.data.id }));
      }
      fetchData(); // Atualiza a lista lateral
    } catch (err) {
      const msg = err.response ? err.response.data : err.message;
      toast.error(`Erro: ${msg}`);
    }
  };

  // --- EXCLUIR ---
  const abrirConfirmacaoExclusao = (id, e) => {
    e.stopPropagation(); // Não carrega o form ao clicar em excluir
    setClienteParaDeletar(id);
    setConfirmModalIsOpen(true);
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/clientes/${clienteParaDeletar}`);
      toast.success('Excluído!');
      setClientes(prev => prev.filter(c => c.id !== clienteParaDeletar));
      if (formData.id === clienteParaDeletar) limparFormulario();
    } catch (err) {
      toast.error('Erro ao excluir (Verifique permissões).');
    } finally {
      setConfirmModalIsOpen(false);
    }
  };

  // Filtro da lista lateral
  const listaFiltrada = clientes.filter(c =>
    c.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (c.cpfCnpj && c.cpfCnpj.includes(termoBusca)) ||
    c.id.toString().includes(termoBusca)
  );

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Gestão de Clientes</h2>

      <div className="split-view">

        {/* --- ESQUERDA: FORMULÁRIO --- */}
        <div className="form-section">
          <div className="form-card">
            {/* Busca por ID (Cabeçalho do Form) */}
            <form onSubmit={handleSubmit}>
              <h4 style={{ marginTop: 0, color: '#000000ff'}}>Dados Pessoais</h4>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="id-search-container" style={{ flex: 1 }}>
                  <label>ID:</label>
                  <input
                    id="id"
                    type="number"
                    className="id-input"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: parseInt(e.target.value) || '' }))}
                    onKeyDown={handleIdKeyDown}
                    placeholder="Novo"
                  />
                </div>
                <div className="form-group" style={{ flex: 8 }}>
                  <label className="form-label">Nome *</label>
                  <input id="nome" type="text" name="nome" className="form-input" value={formData.nome} onChange={handleChange} required maxLength={70} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Tipo:</label>
                  <select
                    name="tipoPessoa"
                    value={formData.tipoPessoa}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">{formData.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}</label>
                  <input id="cpfCnpj" type="text" name="cpfCnpj" className="form-input" value={formData.cpfCnpj} onChange={handleChange} maxLength={18} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Telefone</label>
                  <input id="telefone" type="text" name="telefone" className="form-input" value={formData.telefone} onChange={handleChange} maxLength={15} />
                </div>
                <div className="form-group" style={{ flex: 7 }}>
                  <label className="form-label">Email</label>
                  <input id="email" type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />
              <h4 style={{ marginTop: 0, color: '#000000ff' }}>Endereço</h4>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">CEP {buscandoCep && '...'}</label>
                  <input id="cep" type="text" name="cep" className="form-input" value={formData.cep} onChange={handleChange} maxLength={9} />
                </div>
                <div className="form-group" style={{ flex: 8 }}>
                  <label className="form-label">Rua</label>
                  <input id="logradouro" type="text" name="logradouro" className="form-input" value={formData.logradouro} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Nº</label>
                  <input id="numeroTel" type="text" name="numeroTel" className="form-input" value={formData.numero} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Bairro</label>
                  <input type="text" name="bairro" className="form-input" value={formData.bairro} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Cidade</label>
                  <input type="text" name="cidade" className="form-input" value={formData.cidade} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">UF</label>
                  <input type="text" name="uf" className="form-input" value={formData.uf} onChange={handleChange} maxLength={2} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complemento</label>
                <input type="text" name="complemento" className="form-input" value={formData.complemento} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Salvar Cliente
              </button>
            </form>
          </div>
        </div>

        {/* --- DIREITA: LISTA --- */}
        <div className="list-section">
          <div className="card">
            <h3>Clientes Cadastrados</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="🔍 Buscar por Nome ou CPF..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="form-input"
                style={{ border: '2px solid #0078d4' }}
              />
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>ID</th>
                    <th>Nome / Documento</th>
                    <th style={{ width: '60px' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => preencherFormulario(c)}
                      style={{ cursor: 'pointer', backgroundColor: formData.id === c.id ? '#e3f2fd' : 'white' }}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{c.id}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{c.nome}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{c.cpfCnpj}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => abrirConfirmacaoExclusao(c.id, e)}
                          title="Excluir"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {listaFiltrada.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Nada encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir?"
      />
    </div>
  );
}

export default ClientePage;