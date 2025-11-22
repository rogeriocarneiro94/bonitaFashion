import { useState } from 'react';
import api from "../../../api/api";
import toast from 'react-hot-toast';

export function useVenda() {
  const [venda, setVenda] = useState({
    cliente: null,
    itens: [],
    tipoVenda: 'VAREJO',
    formaPagamento: 'Dinheiro',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);

  // --- AÇÕES ---

  const selecionarCliente = (cliente) => {
    setVenda(prev => ({ ...prev, cliente }));
  };

  const mudarTipoVenda = (tipo) => {
    setVenda(prev => ({ ...prev, tipoVenda: tipo }));
    // Opcional: Recalcular preços dos itens já inseridos se mudar a regra
  };

  const adicionarItem = (produto) => {
    setVenda(prev => {
      const itemExistente = prev.itens.find(i => i.produtoId === produto.id);

      if (itemExistente) {
        return {
          ...prev,
          itens: prev.itens.map(i =>
            i.produtoId === produto.id
              ? { ...i, quantidade: i.quantidade + 1 }
              : i
          )
        };
      }

      // Lógica de Preço: Varejo vs Atacado
      const preco = prev.tipoVenda === 'VAREJO' ? produto.precoVarejo : produto.precoAtacado;

      const novoItem = {
        produtoId: produto.id,
        codigoReferencia: produto.id, // ou outro campo de código
        nomeProduto: produto.nome,
        quantidade: 1,
        valorUnitario: preco,
        desconto: 0,
        estoqueAtual: produto.quantidadeEstoque
      };

      return { ...prev, itens: [...prev.itens, novoItem] };
    });
  };

  const atualizarItem = (produtoId, campo, valor) => {
    setVenda(prev => ({
      ...prev,
      itens: prev.itens.map(item =>
        item.produtoId === produtoId ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const removerItem = (produtoId) => {
    setVenda(prev => ({
      ...prev,
      itens: prev.itens.filter(i => i.produtoId !== produtoId)
    }));
  };

  // --- CÁLCULOS ---
  const totalGeral = venda.itens.reduce((acc, item) => {
    return acc + ((item.quantidade * item.valorUnitario) - (item.desconto || 0));
  }, 0);

  // --- FINALIZAR ---
  const finalizarVenda = async () => {
    if (venda.itens.length === 0) {
      toast.error("Adicione itens à venda!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clienteId: venda.cliente?.id || null,
        tipoVenda: venda.tipoVenda,
        formaPagamento: venda.formaPagamento,
        itens: venda.itens.map(i => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          desconto: i.desconto // Se seu backend aceitar desconto por item
        }))
      };

      const response = await api.post('/vendas', payload);
      toast.success(`Venda #${response.data.id} realizada!`);

      // Resetar venda
      setVenda({
        cliente: null,
        itens: [],
        tipoVenda: 'VAREJO',
        formaPagamento: 'Dinheiro',
        observacoes: ''
      });

    } catch (err) {
      console.error(err);
      toast.error("Erro ao finalizar venda.");
    } finally {
      setLoading(false);
    }
  };

  return {
    venda,
    setVenda, // Exposto caso precise manipular direto
    actions: {
      selecionarCliente,
      adicionarItem,
      atualizarItem,
      removerItem,
      mudarTipoVenda,
      finalizarVenda
    },
    totalGeral,
    loading
  };
}