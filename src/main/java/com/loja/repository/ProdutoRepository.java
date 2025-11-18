package com.loja.repository;

import com.loja.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    /**
     * Encontra todos os produtos que contêm a string fornecida em seu nome,
     * ignorando a diferença entre maiúsculas e minúsculas.
     * O Spring Data JPA cria a consulta SQL automaticamente a partir do nome do método.
     *
     * @param nome A parte do nome a ser pesquisada.
     * @return Uma lista de produtos que correspondem ao critério.
     */
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    List<Produto> findByQuantidadeEstoqueLessThan(int quantidade);

}