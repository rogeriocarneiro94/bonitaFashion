package com.loja.dto;

import com.loja.entity.Produto; // Importe seu model de Produto
import java.math.BigDecimal;
import java.util.List;

public record DashboardDTO(
        BigDecimal faturamentoHoje,
        long numeroVendasHoje,
        List<RankingVendedorDTO> rankingVendedores,
        List<Produto> produtosBaixoEstoque
) {}