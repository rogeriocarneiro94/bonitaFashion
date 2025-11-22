package com.loja.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "itens_venda")
@Data
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_venda", nullable = false)
    @JsonBackReference
    private Venda venda;

    @ManyToOne
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario_venda", nullable = false)
    private Double precoUnitarioVenda; // Preço no momento da venda

    // --- NOVO CAMPO: DESCONTO ---
    // nullable = false obriga a ter um valor no banco (mesmo que seja 0)
    @Column(nullable = false)
    private Double desconto = 0.0;

    // --- MÉTODO CALCULADO (Opcional, mas muito útil) ---
    // Como começa com "get", o JSON de resposta vai incluir um campo "subtotal" automaticamente
    public Double getSubtotal() {
        double preco = precoUnitarioVenda != null ? precoUnitarioVenda : 0.0;
        int qtd = quantidade != null ? quantidade : 0;
        double desc = desconto != null ? desconto : 0.0;

        return (preco * qtd) - desc;
    }
}