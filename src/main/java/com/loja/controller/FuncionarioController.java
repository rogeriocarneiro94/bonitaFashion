package com.loja.controller;

import com.loja.entity.Funcionario;
import com.loja.service.FuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    @PostMapping
    public ResponseEntity<Funcionario> criar(@RequestBody Funcionario funcionario) {
        return new ResponseEntity<>(funcionarioService.criarFuncionario(funcionario), HttpStatus.CREATED);
    }

    // --- AQUI ESTÁ A CORREÇÃO DO PUT ---
    @PutMapping("/{id}")
    public ResponseEntity<Funcionario> atualizar(@PathVariable Long id, @RequestBody Funcionario funcionario) {
        // Chama o método inteligente que preserva a senha antiga
        return ResponseEntity.ok(funcionarioService.atualizar(id, funcionario));
    }

    @GetMapping
    public List<Funcionario> listarTodos() {
        return funcionarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        funcionarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}