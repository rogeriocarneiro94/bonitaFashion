package com.loja.dto;

// Definição simples e moderna (Java 17+)
public record AuthResponse(String token, String nome, String perfil) {
}