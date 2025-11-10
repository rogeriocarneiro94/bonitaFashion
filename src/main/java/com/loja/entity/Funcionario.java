package com.loja.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "funcionarios")
@Getter
@Setter
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String cpf;

    @Column(nullable = false)
    private String cargo;

    @Column(nullable = false, unique = true)
    private String login; // Este será o "username"

    @Column(nullable = false)
    private String senha; // Armazenaremos o hash da senha aqui

    @Column(nullable = false)
    private LocalDate dataAdmissao;
    // construtor padrão
    public Funcionario() {
        this.dataAdmissao = LocalDate.now(); // seta automaticamente
    }
    // Outros campos como data_admissao, ativo, etc.
}