package com.loja.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Cria um construtor com todos os argumentos
public class AuthResponse {
    private String token;
}