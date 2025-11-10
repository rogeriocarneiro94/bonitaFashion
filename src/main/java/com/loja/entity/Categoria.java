package com.loja.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categorias")
@Getter // Adiciona todos os getters em tempo de compilação
@Setter // Adiciona todos os setters em tempo de compilação
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", length = 100, nullable = false, unique = true)
    private String nome;

    // Fim da classe. Muito mais limpo!
}