import React, { useState, useEffect } from 'react';
import api from '../../../../api/api';

export default function ClienteSearch({ onSelect, selected }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);

  // Debounce simples
  useEffect(() => {
    if (termo.length < 3) { setResultados([]); return; }
    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/clientes/buscar?nome=${termo}`);
        setResultados(res.data);
      } catch (e) { console.error(e); }
    }, 400);
    return () => clearTimeout(delay);
  }, [termo]);

  // Se já tem cliente selecionado, mostra o card simples (sem input)
  if (selected) {
    return (
      <div style={{
          padding: '10px',
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '6px',
          color: '#1565c0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '42px' // Para manter altura do input
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>{selected.nome}</strong>
        </span>
        <button
            onClick={() => onSelect(null)}
            style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            title="Remover cliente"
        >
            ✕
        </button>
      </div>
    );
  }

  return (
    <div className="search-wrapper"> {/* Classe nova aqui */}
      <input
        type="text"
        placeholder="Buscar Cliente (F3)..."
        value={termo}
        onChange={e => setTermo(e.target.value)}
        id="buscaCliente"
        autoComplete="off"
      />

      {/* Lista Flutuante usando a classe CSS */}
      {resultados.length > 0 && (
        <ul className="dropdown-results">
          {resultados.map(c => (
            <li key={c.id} onClick={() => { onSelect(c); setTermo(''); setResultados([]); }}>
              <span>{c.nome}</span>
              <small style={{ color: '#666' }}>{c.cpfCnpj}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}