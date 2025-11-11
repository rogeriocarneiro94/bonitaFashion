package com.loja.controller;

import com.loja.entity.Cliente;
import com.loja.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    // Criar um novo cliente (Gerente ou Vendedor)
    @PostMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')")
    public ResponseEntity<Cliente> criar(@RequestBody Cliente cliente) {
        try {
            Cliente novoCliente = clienteService.salvar(cliente);
            return new ResponseEntity<>(novoCliente, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build(); // Retorna 400 Bad Request se o CPF/CNPJ for duplicado
        }
    }

    // Listar todos (Gerente ou Vendedor)
    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')")
    public List<Cliente> listarTodos() {
        return clienteService.listarTodos();
    }

    // Buscar por ID (Gerente ou Vendedor)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualizar um cliente (Gerente ou Vendedor)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente clienteDetails) {
        return clienteService.buscarPorId(id)
                .map(clienteExistente -> {
                    clienteExistente.setNome(clienteDetails.getNome());
                    clienteExistente.setCpfCnpj(clienteDetails.getCpfCnpj());
                    clienteExistente.setTelefone(clienteDetails.getTelefone());
                    clienteExistente.setEmail(clienteDetails.getEmail());

                    Cliente clienteAtualizado = clienteService.salvar(clienteExistente);
                    return ResponseEntity.ok(clienteAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar um cliente (APENAS GERENTE)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            clienteService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }
}