package com.loja.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter // ESSA ANOTAÇÃO É ESSENCIAL
@Setter // ESSA ANOTAÇÃO É ESSENCIAL
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... todos os outros campos ...
    private String nome;
    private String descricao;
    private String codigoBarras;


    @Column(name = "preco_custo", precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Column(name = "preco_varejo", precision = 10, scale = 2)
    private BigDecimal precoVarejo;

    @Column(name = "preco_atacado", precision = 10, scale = 2)
    private BigDecimal precoAtacado;

    private Integer quantidadeEstoque;

    private Boolean ativo; // agora pode usar isAtivo()
    // etc...

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    // NÃO DEVE HAVER GETTERS E SETTERS ESCRITOS MANUALMENTE AQUI
}