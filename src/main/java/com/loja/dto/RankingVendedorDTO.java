package com.loja.dto;

import java.math.BigDecimal;

// Este é um "Record", uma classe DTO moderna e enxuta
public record RankingVendedorDTO(String nome, BigDecimal total) {}