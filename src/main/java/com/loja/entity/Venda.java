package com.loja.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime; // Mais completo que Timestamp, inclui fuso horário
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendas")
@Data
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // Muitas vendas para um funcionário
    @JoinColumn(name = "id_funcionario", nullable = false)
    private Funcionario funcionario;

    @ManyToOne // Muitas vendas para um cliente (pode ser nulo)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @Column(name = "data_hora", nullable = false)
    private OffsetDateTime dataHora;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Column(name = "tipo_venda", nullable = false, length = 20)
    private String tipoVenda; // "VAREJO" ou "ATACADO"

    @Column(name = "forma_pagamento", length = 50)
    private String formaPagamento;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // "CONCLUIDA", "CANCELADA"

    // Relacionamento: Uma Venda tem muitos ItensVenda
    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemVenda> itens = new ArrayList<>();
}