package com.loja.controller;

import com.loja.dto.VendaRequest;
import com.loja.entity.Venda;
import com.loja.service.VendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')") // <-- Corrigido de 'VENDEDDEOR'
    public ResponseEntity<?> realizarVenda(@RequestBody VendaRequest request) { // <-- MUDANÇA AQUI
        try {
            Venda novaVenda = vendaService.realizarVenda(request);
            // Retorna 201 Created com o objeto Venda
            return new ResponseEntity<>(novaVenda, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Retorna 400 Bad Request com a mensagem de erro (String)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')") // <-- Corrigido de 'VENDEDDEOR'
    public List<Venda> listarVendas() {
        return vendaService.listarVendas();
    }
}