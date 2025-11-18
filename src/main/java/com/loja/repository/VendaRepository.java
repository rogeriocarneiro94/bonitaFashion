// Local: src/main/java/com/loja/repository/VendaRepository.java

package com.loja.repository; // (Seu pacote)

import com.loja.dto.RankingVendedorDTO; // (Seu pacote)
import com.loja.entity.Venda; // (Seu pacote)
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime; // <-- IMPORTE ISTO
import java.util.List; // <-- IMPORTE ISTO

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    // --- ESTE É O MÉTODO QUE ESTAVA FALTANDO ---
    // Card 2: Busca vendas dentro de um período (hoje)
    List<Venda> findByDataHoraBetween(OffsetDateTime inicio, OffsetDateTime fim);

    // Card 1: Ranking de Vendedores (Usando JPQL)
    @Query("SELECT new com.loja.dto.RankingVendedorDTO(v.funcionario.nome, SUM(v.valorTotal)) " +
            "FROM Venda v " +
            "GROUP BY v.funcionario.nome " +
            "ORDER BY SUM(v.valorTotal) DESC")
    List<RankingVendedorDTO> findRankingVendedores();
}