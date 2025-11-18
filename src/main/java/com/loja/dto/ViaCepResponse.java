package com.loja.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// DTO para mapear a resposta do ViaCEP
// Ignora campos que não precisamos (como "gia", "ibge", etc.)
@JsonIgnoreProperties(ignoreUnknown = true)
public record ViaCepResponse(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        String localidade, // O ViaCEP chama "cidade" de "localidade"
        String uf
) {}