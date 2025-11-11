package com.loja.controller;

import com.loja.entity.Funcionario;
import com.loja.service.FuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    // Endpoint para CRIAR um novo funcionário
    // POST http://localhost:9090/api/funcionarios
    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Funcionario> criar(@RequestBody Funcionario funcionario) {
        Funcionario novoFuncionario = funcionarioService.salvar(funcionario);
        return new ResponseEntity<>(novoFuncionario, HttpStatus.CREATED);
    }

    // Endpoint para LISTAR todos os funcionários
    // GET http://localhost:9090/api/funcionarios
    @GetMapping
    @PreAuthorize("hasRole('GERENTE')")
    public List<Funcionario> listarTodos() {
        return funcionarioService.listarTodos();
    }

    // Endpoint para BUSCAR um funcionário por ID
    // GET http://localhost:9090/api/funcionarios/1
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para DELETAR um funcionário
    // DELETE http://localhost:9090/api/funcionarios/1
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            funcionarioService.deletar(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}