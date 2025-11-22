package com.loja.dto;

import lombok.Data;

@Data
public class ItemVendaRequest {
    private Long produtoId;
    private int quantidade;

    // Adicione isto:
    private Double desconto = 0.0;
}