package com.loja.dto;

import lombok.Data;
import java.util.List;

@Data
public class VendaRequest {
    private Long funcionarioId; // Quem está vendendo (será pego do token)
    private Long clienteId;     // Para quem (opcional)
    private String tipoVenda;     // "VAREJO" ou "ATACADO"
    private String formaPagamento;
    private List<ItemVendaRequest> itens; // A lista de produtos e quantidades
}