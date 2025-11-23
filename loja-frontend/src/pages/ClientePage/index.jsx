import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { User, MapPin, Search, Save, Trash2, PlusCircle, X } from 'lucide-react';
import './styles.css';

const formInicial = {
  id: '', nome: '', cpfCnpj: '', telefone: '', email: '',
  cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', uf: '', tipoPessoa: 'PF'
};

function ClientePage() {
  const [formData, setFormData] = useState(formInicial);
  const [loading, setLoading] = useState(false);

  // Estados da Busca Flutuante (Estilo PDV)
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const wrapperRef = useRef(null); // Para detectar clique fora

  // Modal e Confirmação
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  // --- MÁSCARAS ---
  const mascaraCPF = v => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substr(0, 14);
  const mascaraCNPJ = v => v.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substr(0, 18);
  const mascaraTelefone = v => {
    let r = v.replace(/\D/g, "");
    if (r.length > 10) return r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    return r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  };
  const mascaraCEP = v => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substr(0, 9);

  // --- BUSCA FLUTUANTE (Igual ao PDV) ---
  useEffect(() => {
    if (termoBusca.length < 2) {
      setResultadosBusca([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        // Usa o endpoint de busca do seu backend
        const response = await api.get(`/clientes/buscar?nome=${termoBusca}`);
        setResultadosBusca(response.data);
      } catch (error) {
        console.error("Erro busca:", error);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [termoBusca]);

  // Fecha a lista se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setResultadosBusca([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  // --- PREENCHIMENTO ---
  const selecionarCliente = (cliente) => {
    const docLimpo = (cliente.cpfCnpj || '').replace(/\D/g, '');
    const tipo = docLimpo.length > 11 ? 'PJ' : 'PF';

    setFormData({
      ...cliente,
      tipoPessoa: tipo,
      cpfCnpj: tipo === 'PF' ? mascaraCPF(cliente.cpfCnpj||'') : mascaraCNPJ(cliente.cpfCnpj||''),
      telefone: mascaraTelefone(cliente.telefone||''),
      cep: mascaraCEP(cliente.cep||'')
    });

    // Limpa a busca após selecionar
    setResultadosBusca([]);
    setTermoBusca('');
    toast.success('Cliente carregado!');
  };

  const limparFormulario = () => {
    setFormData(formInicial);
    setTermoBusca('');
    setResultadosBusca([]);
  };

  // --- HANDLERS DE INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cpfCnpj') val = formData.tipoPessoa === 'PF' ? mascaraCPF(value) : mascaraCNPJ(value);
    if (name === 'telefone') val = mascaraTelefone(value);
    if (name === 'cep') {
      val = mascaraCEP(value);
      if (val.replace(/\D/g, '').length === 8) buscarCEP(val);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const buscarCEP = async (cep) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev, logradouro: data.logradouro, bairro: data.bairro,
          cidade: data.localidade, uf: data.uf
        }));
        toast.success('Endereço encontrado!');
      }
    } catch (e) { toast.error('Erro no CEP'); }
  };

  // --- SALVAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      cep: formData.cep.replace(/\D/g, '')
    };
    delete payload.tipoPessoa;

    try {
      setLoading(true);
      let res;
      if (formData.id) {
        await api.put(`/clientes/${formData.id}`, payload);
        toast.success('Atualizado com sucesso!');
        res = { data: { id: formData.id } };
      } else {
        delete payload.id;
        res = await api.post('/clientes', payload);
        toast.success(`Cliente criado! ID: ${res.data.id}`);
      }
      setFormData(prev => ({ ...prev, id: res.data.id }));
    } catch (err) { toast.error('Erro ao salvar.'); }
    finally { setLoading(false); }
  };

  // --- EXCLUIR ---
  const confirmarExclusao = async () => {
    try {
      await api.delete(`/clientes/${clienteParaDeletar}`);
      toast.success('Excluído!');
      if (formData.id === clienteParaDeletar) limparFormulario();
    } catch (err) { toast.error('Erro ao excluir.'); }
    finally { setConfirmModalIsOpen(false); }
  };

  return (
    <div className="cliente-page-container">

      {/* 1. BARRA DE BUSCA "ESTILO PDV" (Fica fora do card) */}
      <div className="search-section" ref={wrapperRef}>
        <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
                type="text"
                placeholder="Buscar cliente por Nome, CPF ou ID..."
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                autoComplete="off"
                maxLength={50}
            />
            {termoBusca && (
                <button className="btn-clear-search" onClick={() => {setTermoBusca(''); setResultadosBusca([])}}>
                    <X size={16} />
                </button>
            )}
        </div>

        {/* LISTA FLUTUANTE DE RESULTADOS */}
        {resultadosBusca.length > 0 && (
            <ul className="search-results-dropdown">
                {resultadosBusca.map(c => (
                    <li key={c.id} onClick={() => selecionarCliente(c)}>
                        <div className="info-main">{c.nome}</div>
                        <div className="info-sub">
                            {c.cpfCnpj} • {c.cidade}/{c.uf}
                        </div>
                    </li>
                ))}
            </ul>
        )}
      </div>

      {/* 2. FORMULÁRIO CENTRALIZADO */}
      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>

          <div className="form-header-actions">
             <h2>{formData.id ? `Editando Cliente #${formData.id}` : 'Novo Cadastro'}</h2>
             <button type="button" className="btn-novo" onClick={limparFormulario}>
                <PlusCircle size={18} /> Limpar / Novo
             </button>
          </div>

          {/* CARD DADOS PESSOAIS */}
          <div className="form-card">
            <div className="card-header">
               <User size={20} className="card-icon"/> <h3>Dados Pessoais</h3>
            </div>

            <div className="row">
               <div className="col-nome">
                  <label>Nome Completo *</label>
                  <input name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required placeholder="Ex: João Santos"
                  maxLength={80}/>
               </div>
               <div className="col-tipo">
                  <label>Tipo</label>
                  <select name="tipoPessoa"
                  value={formData.tipoPessoa}
                  onChange={e => setFormData(p => ({...p, tipoPessoa: e.target.value}))}>
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
               </div>
            </div>

            <div className="row">
               <div className="col-doc">
                  <label>{formData.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}</label>
                  <input name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder="000.000.000-00" />
               </div>
               <div className="col-tel">
                  <label>Telefone</label>
                  <input name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000" />
               </div>
               <div className="col-email">
                  <label>Email</label>
                  <input name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="cliente@email.com"
                  maxLength={60}/>
               </div>
            </div>
          </div>

          {/* CARD ENDEREÇO */}
          <div className="form-card mt-20">
             <div className="card-header">
               <MapPin size={20}
               className="card-icon"/>
               <h3>Endereço</h3>
             </div>

             <div className="row">
                <div className="col-cep">
                   <label>CEP</label>
                   <input name="cep"
                   value={formData.cep} o
                   nChange={handleChange}
                   maxLength={9}
                   placeholder="00000-000" />
                </div>
                <div className="col-rua">
                   <label>Logradouro</label>
                   <input name="logradouro"
                   value={formData.logradouro}
                   onChange={handleChange}
                   maxLength={60} />
                </div>
                <div className="col-num">
                   <label>Nº</label>
                   <input name="numero"
                   value={formData.numero}
                   onChange={handleChange}
                   maxLength={4}/>
                </div>
             </div>

             <div className="row">
                <div className="col-bairro">
                   <label>Bairro</label>
                   <input name="bairro"
                   value={formData.bairro}
                   onChange={handleChange}
                   maxLength={20}/>
                </div>
                <div className="col-cidade">
                   <label>Cidade</label>
                   <input name="cidade"
                   value={formData.cidade}
                   onChange={handleChange}
                   maxLength={20}/>
                </div>
                <div className="col-uf">
                   <label>UF</label>
                   <input name="uf"
                   value={formData.uf}
                   onChange={handleChange}
                   maxLength={2} />
                </div>
             </div>

             <div className="row">
                <div className="col-full">
                    <label>Complemento</label>
                    <input name="complemento" value={formData.complemento} onChange={handleChange} maxLength={70}/>
                </div>
             </div>
          </div>

          {/* BARRA DE AÇÕES FLUTUANTE OU FIXA */}
          <div className="actions-bar">
             {formData.id && (
               <button type="button" className="btn-delete" onClick={() => { setClienteParaDeletar(formData.id); setConfirmModalIsOpen(true); }}>
                  <Trash2 size={18} /> Excluir Cliente
               </button>
             )}

             <div style={{flex: 1}}></div> {/* Espaçador */}

             <button type="submit" className="btn-save" disabled={loading}>
                <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
             </button>
          </div>

        </form>
      </div>

      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Cliente"
        message="Tem certeza? Essa ação não pode ser desfeita."
      />
    </div>
  );
}

export default ClientePage;