package com.loja.service;

import com.loja.dto.DashboardDTO;
import com.loja.dto.RankingVendedorDTO;
import com.loja.entity.Produto;
import com.loja.entity.Venda;
import com.loja.repository.ProdutoRepository;
import com.loja.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;

    private static final int LIMITE_BAIXO_ESTOQUE = 10;

    public DashboardDTO getDashboardStats() {

        // --- Card 2: Vendas do Dia ---
        OffsetDateTime inicioDoDia = OffsetDateTime.now().with(LocalTime.MIN);
        OffsetDateTime fimDoDia = OffsetDateTime.now().with(LocalTime.MAX);

        List<Venda> vendasHoje = vendaRepository.findByDataHoraBetween(inicioDoDia, fimDoDia);

        long numeroVendasHoje = vendasHoje.size();
        BigDecimal faturamentoHoje = vendasHoje.stream()
                .map(Venda::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // --- Card 1: Ranking de Vendedores ---
        List<RankingVendedorDTO> ranking = vendaRepository.findRankingVendedores();

        // --- Card 3: Baixo Estoque ---
        List<Produto> baixoEstoque = produtoRepository.findByQuantidadeEstoqueLessThan(LIMITE_BAIXO_ESTOQUE);

        // Monta o DTO de resposta
        return new DashboardDTO(faturamentoHoje, numeroVendasHoje, ranking, baixoEstoque);
    }
}