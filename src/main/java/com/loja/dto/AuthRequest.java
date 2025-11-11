package com.loja.dto;

import lombok.Data;

@Data // Anotação do Lombok que cria Getters, Setters, Construtor, etc.
public class AuthRequest {
    private String login;
    private String senha;
}