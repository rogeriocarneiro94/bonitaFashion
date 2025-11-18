package com.loja.entity; // (Seu pacote)

import jakarta.persistence.*;
import jakarta.validation.constraints.Email; // Importe
import jakarta.validation.constraints.Size;  // Importe
import lombok.Data;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- REGRAS ATUALIZADAS ---
    @Size(max = 70, message = "O nome deve ter no máximo 70 caracteres")
    @Column(nullable = false, length = 70)
    private String nome;

    @Size(max = 18, message = "CPF/CNPJ muito longo")
    @Column(unique = true, length = 18)
    private String cpfCnpj;

    @Size(max = 15, message = "Telefone muito longo") // (xx) xxxxx-xxxx
    @Column(length = 15)
    private String telefone;

    @Email(message = "Email inválido")
    @Size(max = 100)
    @Column(length = 100)
    private String email;

    // --- NOVOS CAMPOS DE ENDEREÇO ---

    @Column(length = 10)
    private String cep;

    @Column(length = 255)
    private String logradouro;

    @Column(length = 20)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 100)
    private String bairro;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String uf; // Estado (UF)
}