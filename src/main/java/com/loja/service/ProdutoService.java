package com.loja.service;

import com.loja.entity.Categoria;
import com.loja.entity.Produto;
import com.loja.repository.CategoriaRepository;
import com.loja.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante para transações

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    // Injetamos ambos os repositórios que este serviço precisa para trabalhar
    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    /**
     * Retorna uma lista de todos os produtos cadastrados.
     * @return Lista de Produtos.
     */
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    /**
     * Busca um produto específico pelo seu ID.
     * @param id O ID do produto.
     * @return Um Optional contendo o Produto, se encontrado.
     */
    public Optional<Produto> buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }

    /**
     * Salva um novo produto ou atualiza um existente.
     * Contém a regra de negócio para garantir que a categoria do produto exista.
     * @param produto O produto a ser salvo.
     * @return O produto salvo.
     * @throws IllegalStateException se a categoria associada ao produto não existir.
     */
    @Transactional // Garante que a operação seja atômica (ou tudo funciona, ou nada é salvo)
    public Produto salvar(Produto produto) {
        // --- INÍCIO DA LÓGICA DE NEGÓCIO ---
        Categoria categoria = produto.getCategoria();

        // Validação 1: O produto deve ter uma categoria
        if (categoria == null || categoria.getId() == null) {
            throw new IllegalStateException("O produto deve estar associado a uma categoria existente.");
        }

        // Validação 2: A categoria informada deve existir no banco de dados
        categoriaRepository.findById(categoria.getId())
                .orElseThrow(() -> new IllegalStateException("A categoria com ID " + categoria.getId() + " não foi encontrada."));
        // --- FIM DA LÓGICA DE NEGÓCIO ---

        return produtoRepository.save(produto);
    }

    /**
     * Deleta um produto pelo seu ID.
     * @param id O ID do produto a ser deletado.
     */
    public void deletar(Long id) {
        // Validação: Garante que o produto existe antes de tentar deletar
        if (!produtoRepository.existsById(id)) {
            throw new IllegalStateException("Produto com ID " + id + " não encontrado para exclusão.");
        }
        produtoRepository.deleteById(id);
    }

    /**
     * Busca produtos pelo nome, usando o método customizado do repositório.
     * @param nome O termo de busca.
     * @return Lista de produtos cujo nome contém o termo de busca.
     */
    public List<Produto> buscarPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome);
    }
}