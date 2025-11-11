package com.loja.service;

import com.loja.dto.ItemVendaRequest;
import com.loja.dto.VendaRequest;
import com.loja.entity.*;
import com.loja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante!

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendaService {

    // O serviço de venda precisa de (quase) todos os outros repositórios
    private final VendaRepository vendaRepository;
    private final ItemVendaRepository itemVendaRepository;
    private final ProdutoRepository produtoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ClienteRepository clienteRepository;

    @Transactional // A MÁGICA ACONTECE AQUI!
    public Venda realizarVenda(VendaRequest request) {

        // 1. IDENTIFICAR O FUNCIONÁRIO (VENDEDOR)
        // Pega o login do usuário (ex: "vendedor") que está autenticado via token JWT
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Funcionario funcionario = funcionarioRepository.findByLogin(login)
                .orElseThrow(() -> new IllegalStateException("Funcionário não encontrado"));

        // 2. BUSCAR O CLIENTE (OPCIONAL)
        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new IllegalStateException("Cliente não encontrado"));
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
            produtoRepository.save(produto); // Salva o produto com o novo estoque

            // 4d. Definir o preço (Varejo ou Atacado)
            BigDecimal precoUnitario;
            if ("ATACADO".equalsIgnoreCase(request.getTipoVenda())) {
                precoUnitario = produto.getPrecoAtacado();
            } else {
                precoUnitario = produto.getPrecoVarejo();
            }

            // 4e. Criar o ItemVenda
            ItemVenda itemVenda = new ItemVenda();
            itemVenda.setVenda(venda); // Associa com a venda "mãe"
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(itemReq.getQuantidade());
            itemVenda.setPrecoUnitarioVenda(precoUnitario);

            itensParaSalvar.add(itemVenda);

            // 4f. Somar ao valor total da venda
            valorTotalVenda = valorTotalVenda.add(precoUnitario.multiply(new BigDecimal(itemReq.getQuantidade())));
        }

        // 5. FINALIZAR A VENDA
        venda.setValorTotal(valorTotalVenda);
        venda.setItens(itensParaSalvar); // Adiciona a lista de itens à venda

        return vendaRepository.save(venda); // Salva a Venda (e os ItensVenda em cascata)
    }

    // (Opcional) Método para listar vendas
    public List<Venda> listarVendas() {
        return vendaRepository.findAll();
    }
}