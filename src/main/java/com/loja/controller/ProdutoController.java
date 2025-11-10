package com.loja.controller;

import com.loja.entity.Produto;
import com.loja.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    // Endpoint para LISTAR todos os produtos
    // GET http://localhost:8080/api/produtos
    @GetMapping
    public List<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    // Endpoint para BUSCAR um produto por ID
    // GET http://localhost:8080/api/produtos/1
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok) // Equivalente a .map(produto -> ResponseEntity.ok(produto))
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para BUSCAR produtos por nome
    // GET http://localhost:8080/api/produtos/buscar?nome=camiseta
    @GetMapping("/buscar")
    public List<Produto> buscarPorNome(@RequestParam String nome) {
        return produtoService.buscarPorNome(nome);
    }

    // Endpoint para CRIAR um novo produto
    // POST http://localhost:8080/api/produtos
    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody Produto produto) {
        try {
            Produto novoProduto = produtoService.salvar(produto);
            return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Retorna um 400 Bad Request se a regra de negócio do serviço falhar (ex: categoria não existe)
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint para ATUALIZAR um produto existente
    // PUT http://localhost:8080/api/produtos/1
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody Produto produtoDetails) {
        return produtoService.buscarPorId(id)
                .map(produtoExistente -> {
                    // Atualiza os campos do produto existente com os detalhes recebidos
                    produtoExistente.setNome(produtoDetails.getNome());
                    produtoExistente.setDescricao(produtoDetails.getDescricao());
                    produtoExistente.setCodigoBarras(produtoDetails.getCodigoBarras());
                    produtoExistente.setPrecoCusto(produtoDetails.getPrecoCusto());
                    produtoExistente.setPrecoVarejo(produtoDetails.getPrecoVarejo());
                    produtoExistente.setPrecoAtacado(produtoDetails.getPrecoAtacado());
                    produtoExistente.setQuantidadeEstoque(produtoDetails.getQuantidadeEstoque());
                    produtoExistente.setAtivo(produtoDetails.getAtivo());
                    produtoExistente.setCategoria(produtoDetails.getCategoria()); // Atualiza a categoria

                    Produto produtoAtualizado = produtoService.salvar(produtoExistente);
                    return ResponseEntity.ok(produtoAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para DELETAR um produto
    // DELETE http://localhost:8080/api/produtos/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            produtoService.deletar(id);
            return ResponseEntity.noContent().build(); // Retorna 204 No Content
        } catch (IllegalStateException e) {
            // Retorna 404 se o produto não for encontrado para exclusão
            return ResponseEntity.notFound().build();
        }
    }
}