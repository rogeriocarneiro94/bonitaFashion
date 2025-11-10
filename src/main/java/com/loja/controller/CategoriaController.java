package com.loja.controller;

import com.loja.entity.Categoria;
import com.loja.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Combina @Controller e @ResponseBody, indicando que os retornos dos métodos serão o corpo da resposta (JSON)
@RequestMapping("/api/categorias") // Define a URL base para todos os métodos neste controller
public class CategoriaController {

    private final CategoriaService categoriaService;

    @Autowired
    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // Endpoint para LISTAR todas as categorias
    // GET http://localhost:8080/api/categorias
    @GetMapping
    public List<Categoria> listarTodas() {
        return categoriaService.listarTodas();
    }

    // Endpoint para BUSCAR uma categoria por ID
    // GET http://localhost:8080/api/categorias/1
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return categoriaService.buscarPorId(id)
                .map(categoria -> ResponseEntity.ok(categoria)) // Se encontrar, retorna 200 OK com a categoria no corpo
                .orElseGet(() -> ResponseEntity.notFound().build()); // Se não encontrar, retorna 404 Not Found
    }

    // Endpoint para CRIAR uma nova categoria
    // POST http://localhost:8080/api/categorias
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Retorna o status HTTP 201 Created
    public Categoria criar(@RequestBody Categoria categoria) {
        return categoriaService.salvar(categoria);
    }

    // Endpoint para ATUALIZAR uma categoria existente
    // PUT http://localhost:8080/api/categorias/1
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable Long id, @RequestBody Categoria categoriaDetails) {
        return categoriaService.buscarPorId(id)
                .map(categoriaExistente -> {
                    categoriaExistente.setNome(categoriaDetails.getNome());
                    Categoria categoriaAtualizada = categoriaService.salvar(categoriaExistente);
                    return ResponseEntity.ok(categoriaAtualizada);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para DELETAR uma categoria
    // DELETE http://localhost:8080/api/categorias/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!categoriaService.buscarPorId(id).isPresent()) {
            return ResponseEntity.notFound().build(); // Retorna 404 se a categoria não existe
        }
        categoriaService.deletar(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content, o padrão para exclusão bem-sucedida
    }
}