package com.loja.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_venda")
@Data
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // Muitos itens para uma venda
    @JoinColumn(name = "id_venda", nullable = false)
    private Venda venda;

    @ManyToOne // Muitos itens (vendas) para um produto
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private int quantidade;

    @Column(name = "preco_unitario_venda", nullable = false)
    private BigDecimal precoUnitarioVenda; // Preço no momento da venda
}