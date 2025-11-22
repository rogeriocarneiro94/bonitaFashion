package com.loja.service;

import com.loja.dto.ItemVendaRequest;
import com.loja.dto.VendaRequest;
import com.loja.entity.*;
import com.loja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ItemVendaRepository itemVendaRepository; // Usado implicitamente pelo Cascade, mas bom ter aqui
    private final ProdutoRepository produtoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public Venda realizarVenda(VendaRequest request) {

        // 1. IDENTIFICAR O FUNCIONÁRIO (VENDEDOR)
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Funcionario funcionario = funcionarioRepository.findByLogin(login)
                .orElseThrow(() -> new IllegalStateException("Funcionário não encontrado"));

        // 2. BUSCAR O CLIENTE (OPCIONAL)
        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new IllegalStateException("Cliente com ID " + request.getClienteId() + " não encontrado"));
        }

        // 3. CRIAR A VENDA "MÃE"
        Venda venda = new Venda();
        venda.setFuncionario(funcionario);
        venda.setCliente(cliente);
        venda.setDataHora(OffsetDateTime.now());
        venda.setTipoVenda(request.getTipoVenda());
        venda.setFormaPagamento(request.getFormaPagamento());
        venda.setStatus("CONCLUIDA");

        BigDecimal valorTotalVenda = BigDecimal.ZERO;
        List<ItemVenda> itensParaSalvar = new ArrayList<>();

        // 4. PROCESSAR CADA ITEM DA VENDA
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new IllegalStateException("A venda deve conter pelo menos um item.");
        }

        for (ItemVendaRequest itemReq : request.getItens()) {

            // 4a. Buscar o produto no banco
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new IllegalStateException("Produto com ID " + itemReq.getProdutoId() + " não encontrado."));

            // 4b. VERIFICAR ESTOQUE
            if (produto.getQuantidadeEstoque() < itemReq.getQuantidade()) {
                throw new IllegalStateException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // 4c. DAR BAIXA NO ESTOQUE
            int novoEstoque = produto.getQuantidadeEstoque() - itemReq.getQuantidade();
            produto.setQuantidadeEstoque(novoEstoque);
            produtoRepository.save(produto);

            // 4d. Definir o preço unitário (Lida com BigDecimal)
            BigDecimal precoUnitario;
            if ("ATACADO".equalsIgnoreCase(request.getTipoVenda())) {
                // Se seu Produto retorna BigDecimal, mantém. Se retornar Double, converte: BigDecimal.valueOf(...)
                precoUnitario = produto.getPrecoAtacado();
            } else {
                precoUnitario = produto.getPrecoVarejo();
            }

            // --- LÓGICA DO DESCONTO ---
            // 1. Pega o desconto do DTO (Double) e garante que não é null
            Double descontoDouble = itemReq.getDesconto() != null ? itemReq.getDesconto() : 0.0;
            BigDecimal valorDesconto = BigDecimal.valueOf(descontoDouble);

            // 2. Calcula Valor Bruto do Item (Preço * Qtd)
            BigDecimal quantidadeBD = new BigDecimal(itemReq.getQuantidade());
            BigDecimal valorItemBruto = precoUnitario.multiply(quantidadeBD);

            // 3. Validação: Desconto não pode ser maior que o item
            if (valorDesconto.compareTo(valorItemBruto) > 0) {
                throw new IllegalStateException("O desconto (" + valorDesconto + ") no produto " + produto.getNome() +
                        " não pode ser maior que o valor do item (" + valorItemBruto + ")");
            }

            // 4e. Criar o ItemVenda
            ItemVenda itemVenda = new ItemVenda();
            itemVenda.setVenda(venda);
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(itemReq.getQuantidade());

            // CONVERSÃO IMPORTANTE: Entity usa Double, mas cálculo foi BigDecimal
            itemVenda.setPrecoUnitarioVenda(precoUnitario.doubleValue());
            itemVenda.setDesconto(descontoDouble); // Salva o desconto no banco

            itensParaSalvar.add(itemVenda);

            // 4f. Somar ao valor total da venda (Líquido = Bruto - Desconto)
            BigDecimal valorItemLiquido = valorItemBruto.subtract(valorDesconto);
            valorTotalVenda = valorTotalVenda.add(valorItemLiquido);
        }

        // 5. FINALIZAR A VENDA
        venda.setValorTotal(valorTotalVenda);
        venda.setItens(itensParaSalvar);

        return vendaRepository.save(venda);
    }

    // Método auxiliar para listar vendas (caso precise)
    public List<Venda> listarVendas() {
        return vendaRepository.findAll();
    }
}