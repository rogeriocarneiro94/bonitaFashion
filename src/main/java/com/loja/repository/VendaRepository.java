package com.loja.repository;

import com.loja.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    // Futuramente, podemos adicionar buscas por data ou por funcionário
}