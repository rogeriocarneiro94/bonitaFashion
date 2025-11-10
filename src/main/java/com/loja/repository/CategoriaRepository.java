package com.loja.repository;
import com.loja.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Anotação que indica ao Spring que esta é uma interface de repositório
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // Pronto! Não precisa de mais nada por enquanto.
}