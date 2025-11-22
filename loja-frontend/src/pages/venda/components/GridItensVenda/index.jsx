import React from 'react';
import styles from './styles.module.css'; // Importando estilos locais
import { Trash2 } from 'lucide-react'; // Ícone de lixeira (opcional, use o que preferir)

// Função utilitária para formatar moeda (pode extrair para um arquivo utils.js)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const GridItensVenda = ({ itens, onUpdateItem, onRemoveItem }) => {

  // Função segura para lidar com mudanças numéricas nos inputs
  const handleNumberChange = (itemId, field, value) => {
    // Garante que é um número, ou zero se estiver vazio/inválido
    let numValue = parseFloat(value) || 0;

    // Validação básica: quantidade não pode ser menor que 1
    if (field === 'quantidade' && numValue < 1) numValue = 1;

    // Avisa o componente pai que houve mudança
    onUpdateItem(itemId, field, numValue);
  };

  return (
    <div className={styles.gridContainer}>
      <table className={styles.erpTable}>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>#</th>
            <th style={{ width: '10%' }}>Cód.</th>
            <th style={{ width: '35%', textAlign: 'left' }}>Descrição Produto</th>
            <th style={{ width: '10%' }}>Qtd.</th>
            <th style={{ width: '12%' }}>Vl. Unit.</th>
            {/* Campo editável de Desconto em R$ por item */}
            <th style={{ width: '10%' }}>Desc. (R$)</th>
            <th style={{ width: '13%' }}>Subtotal</th>
            <th style={{ width: '5%' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.emptyState}>
                Nenhum item lançado. Use a busca acima ou pressione F2.
              </td>
            </tr>
          ) : (
            itens.map((item, index) => {
               // Calcula o subtotal na hora do render: (Qtd * Unitario) - Desconto
               const subtotal = (item.quantidade * item.valorUnitario) - (item.desconto || 0);

               return (
                <tr key={item.produtoId || index}>
                  <td>{index + 1}</td>
                  <td>{item.codigoReferencia}</td>
                  <td style={{ textAlign: 'left' }} title={item.nomeProduto}>
                    {item.nomeProduto}
                    {/* Exibe alerta se for venda futura sem estoque */}
                    {item.quantidade > item.estoqueAtual && (
                        <span className={styles.badgeEstoque}>Sem estoque físico</span>
                    )}
                  </td>

                  {/* --- CÉLULA EDITÁVEL: QUANTIDADE --- */}
                  <td className={styles.editableCell}>
                    <input
                      type="number"
                      min="1"
                      className={styles.erpInput}
                      value={item.quantidade}
                      onChange={(e) => handleNumberChange(item.produtoId, 'quantidade', e.target.value)}
                      onFocus={(e) => e.target.select()} // Seleciona tudo ao clicar
                    />
                  </td>

                  <td>{formatCurrency(item.valorUnitario)}</td>

                  {/* --- CÉLULA EDITÁVEL: DESCONTO R$ --- */}
                  <td className={styles.editableCell}>
                      <input
                        type="number"
                        min="0"
                        step="0.01" // Permite centavos
                        className={styles.erpInput}
                        value={item.desconto || ''}
                        placeholder="0,00"
                        onChange={(e) => handleNumberChange(item.produtoId, 'desconto', e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                  </td>

                  <td style={{ fontWeight: 'bold' }}>
                    {formatCurrency(subtotal)}
                  </td>

                  <td>
                    <button
                        type="button"
                        onClick={() => onRemoveItem(item.produtoId)}
                        className={styles.btnRemove}
                        title="Remover item (Del)"
                        tabIndex="-1" // Pula no tab para focar nos inputs
                    >
                       <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GridItensVenda;