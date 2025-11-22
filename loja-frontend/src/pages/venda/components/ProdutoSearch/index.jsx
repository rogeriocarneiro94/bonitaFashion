import React, { useState, useEffect, useRef } from 'react';
import api from "../../../../api/api";
import toast from 'react-hot-toast';

export default function ProdutoSearch({ onAdd }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (termo.length < 2) { setResultados([]); return; }
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await api.get(`/produtos/buscar?nome=${termo}`);
        setResultados(response.data);
      } catch (error) { console.error("Erro produto:", error); }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [termo]);

  const handleSelecionar = (produto) => {
    if (produto.quantidadeEstoque <= 0) toast.error(`Atenção: ${produto.nome} sem estoque!`);
    onAdd(produto);
    setTermo('');
    setResultados([]);
    inputRef.current?.focus();
  };

  return (
    <div className="search-wrapper"> {/* Classe nova aqui */}
      <input
        ref={inputRef}
        id="buscaProduto"
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Bipar ou digitar..."
        autoComplete="off"
      />

      {/* Lista Flutuante Limpa */}
      {resultados.length > 0 && (
        <ul className="dropdown-results">
          {resultados.map((prod) => (
            <li key={prod.id} onClick={() => handleSelecionar(prod)}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{prod.nome}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Ref: {prod.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#27ae60', fontWeight: 'bold' }}>
                   R$ {prod.precoVarejo?.toFixed(2)}
                </div>
                <div style={{ fontSize: '10px' }}>Est: {prod.quantidadeEstoque}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}