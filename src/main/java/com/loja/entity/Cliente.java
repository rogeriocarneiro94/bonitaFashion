package com.loja.entity;

import jakarta.persistence.*;
import lombok.Data; // Anotação do Lombok que combina @Getter, @Setter, @ToString, etc.

@Entity
@Table(name = "clientes")
@Data // Usaremos @Data para este POJO simples
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, length = 18) // 18 caracteres para cobrir um CNPJ (14.333.333/0001-11)
    private String cpfCnpj;

    private String telefone;

    private String email;
}