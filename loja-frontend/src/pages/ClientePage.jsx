// Local: src/pages/ClientePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

Modal.setAppElement('#root');

// Estado inicial do formulário
const formInicialVazio = {
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
  tipoPessoa: 'PF' // PF ou PJ
};

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Modal ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [formData, setFormData] = useState(formInicialVazio);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // --- Estados do Modal de Confirmação ---
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  // --- Ref para controle de foco ---
  const primeiroInputRef = useRef(null);

  // ✅ Handler para prevenir que o Modal capture o Tab
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Não faz nada, deixa o navegador gerenciar o Tab naturalmente
      if (e.key === 'Tab') {
        // Permite comportamento padrão
        return;
      }
    };

    if (modalIsOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalIsOpen]);

  // ======================
  // FUNÇÕES DE MÁSCARA
  // ======================

  const mascararCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mascararCNPJ = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mascararTelefone = (valor) => {
    const numbers = valor.replace(/\D/g, '');

    // Celular (11) 98888-8888
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    // Fixo (11) 3888-8888
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    // Parcial
    if (numbers.length > 6) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    }
    if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    return numbers;
  };

  const mascararCEP = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // ======================
  // BUSCA DE CEP
  // ======================

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado!');
        return;
      }

      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
        complemento: data.complemento || prev.complemento
      }));

      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setBuscandoCep(false);
    }
  };

  // ======================
  // HANDLERS
  // ======================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    let valorFormatado = value;

    // Aplica máscaras conforme o campo
    if (name === 'cpfCnpj') {
      valorFormatado = formData.tipoPessoa === 'PF'
        ? mascararCPF(value)
        : mascararCNPJ(value);
    } else if (name === 'telefone') {
      valorFormatado = mascararTelefone(value);
    } else if (name === 'cep') {
      valorFormatado = mascararCEP(value);

      // Se completou o CEP, busca automaticamente
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCEP(value);
      }
    }

    setFormData(prev => ({ ...prev, [name]: valorFormatado }));
  };

  const handleTipoPessoaChange = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipoPessoa: tipo,
      cpfCnpj: '' // Limpa o campo ao trocar o tipo
    }));
  };

  // ======================
  // FUNÇÕES DE API
  // ======================

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

  useEffect(() => {
    fetchData();
  }, []);

  const fecharModal = () => {
    setModalIsOpen(false);
    setClienteEmEdicao(null);
    setFormData(formInicialVazio);
  };

  const abrirModalNovo = () => {
    setClienteEmEdicao(null);
    setFormData(formInicialVazio);
    setModalIsOpen(true);
    // Foca o primeiro campo após abrir
    setTimeout(() => {
      if (primeiroInputRef.current) {
        primeiroInputRef.current.focus();
      }
    }, 100);
  };

  const abrirModalEdicao = (cliente) => {
    setClienteEmEdicao(cliente);

    // Detecta tipo de pessoa baseado no tamanho do CPF/CNPJ
    const cpfCnpjLimpo = (cliente.cpfCnpj || '').replace(/\D/g, '');
    const tipoPessoa = cpfCnpjLimpo.length === 14 ? 'PJ' : 'PF';

    setFormData({
      nome: cliente.nome || '',
      cpfCnpj: tipoPessoa === 'PF'
        ? mascararCPF(cliente.cpfCnpj || '')
        : mascararCNPJ(cliente.cpfCnpj || ''),
      telefone: mascararTelefone(cliente.telefone || ''),
      email: cliente.email || '',
      cep: mascararCEP(cliente.cep || ''),
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      uf: cliente.uf || '',
      tipoPessoa: tipoPessoa
    });
    setModalIsOpen(true);
    // Foca o primeiro campo após abrir
    setTimeout(() => {
      if (primeiroInputRef.current) {
        primeiroInputRef.current.focus();
      }
    }, 100);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Remove máscaras antes de enviar
    const payload = {
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      cep: formData.cep.replace(/\D/g, '')
    };

    // Remove campo auxiliar
    delete payload.tipoPessoa;

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
    } catch (err) {
      const errorMsg = err.response
        ? (err.response.status === 403
            ? "Você não tem permissão para excluir."
            : err.response.data)
        : err.message;
      toast.error('Erro ao excluir cliente: ' + errorMsg);
    } finally {
      setConfirmModalIsOpen(false);
      setClienteParaDeletar(null);
    }
  };

  // ======================
  // RENDERIZAÇÃO
  // ======================

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Gerenciamento de Clientes</h2>
      <button onClick={abrirModalNovo}>Adicionar Novo Cliente</button>

      {/* MODAL DE FORMULÁRIO */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={fecharModal}
        contentLabel="Formulário de Cliente"
        overlayClassName="ModalOverlay"
        className="ModalContent"
        closeTimeoutMS={200}
        shouldFocusAfterRender={true}
        shouldReturnFocusAfterClose={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        parentSelector={() => document.body}
      >
        <h2>{clienteEmEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h2>

        <form onSubmit={handleSubmitForm}>
          <label>Nome: *</label>
          <input
            ref={primeiroInputRef}
            tabIndex={1}
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleFormChange}
            required
            maxLength={70}
            style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          />

          <label>Email:</label>
          <input
            tabIndex={2}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          />

          <label>Telefone:</label>
          <input
            tabIndex={3}
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleFormChange}
            placeholder="(11) 98888-8888"
            maxLength={15}
            style={{ pointerEvents: 'auto', userSelect: 'auto' }}
          />

          {/* SELETOR DE TIPO DE PESSOA */}
          <label>Tipo de Pessoa:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              tabIndex={0}
              type="button"
              onClick={() => handleTipoPessoaChange('PF')}
              style={{
                padding: '8px 16px',
                backgroundColor: formData.tipoPessoa === 'PF' ? '#007bff' : '#e0e0e0',
                color: formData.tipoPessoa === 'PF' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Pessoa Física (CPF)
            </button>
            <button
              tabIndex={0}
              type="button"
              onClick={() => handleTipoPessoaChange('PJ')}
              style={{
                padding: '8px 16px',
                backgroundColor: formData.tipoPessoa === 'PJ' ? '#007bff' : '#e0e0e0',
                color: formData.tipoPessoa === 'PJ' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Pessoa Jurídica (CNPJ)
            </button>
          </div>

          <label>{formData.tipoPessoa === 'PF' ? 'CPF:' : 'CNPJ:'}</label>
          <input
            tabIndex={0}
            type="text"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleFormChange}
            placeholder={formData.tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
            maxLength={formData.tipoPessoa === 'PF' ? 14 : 18}
          />

          <hr />
          <h4>Endereço</h4>

          <label>CEP: {buscandoCep && <span style={{ color: '#007bff' }}>🔄 Buscando...</span>}</label>
          <input
            tabIndex={0}
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleFormChange}
            placeholder="00000-000"
            maxLength={9}
          />
          <small style={{ color: '#666' }}>Digite o CEP para preencher automaticamente</small>

          <label>Logradouro (Rua/Av):</label>
          <input
            tabIndex={0}
            type="text"
            name="logradouro"
            value={formData.logradouro}
            onChange={handleFormChange}
          />

          <label>Número:</label>
          <input
            tabIndex={0}
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleFormChange}
          />

          <label>Bairro:</label>
          <input
            tabIndex={0}
            type="text"
            name="bairro"
            value={formData.bairro}
            onChange={handleFormChange}
          />

          <label>Cidade:</label>
          <input
            tabIndex={0}
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleFormChange}
          />

          <label>UF:</label>
          <input
            tabIndex={0}
            type="text"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            maxLength={2}
            style={{ textTransform: 'uppercase' }}
          />

          <label>Complemento:</label>
          <input
            tabIndex={0}
            type="text"
            name="complemento"
            value={formData.complemento}
            onChange={handleFormChange}
          />

          <br/>
          <div className="confirmation-buttons">
            <button
              tabIndex={0}
              type="button"
              className="btn-secondary"
              onClick={fecharModal}
            >
              Cancelar
            </button>
            <button
              tabIndex={0}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este cliente?"
      />

      {/* Tabela de Clientes */}
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