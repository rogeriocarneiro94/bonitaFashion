// Local: src/main/java/com/loja/repository/ItemVendaRepository.java

package com.loja.repository; // (Seu pacote)

import com.loja.entity.ItemVenda; // (Seu pacote)
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {
    // ESTE ARQUIVO DEVE ESTAR VAZIO (ou quase)
    // REMOVA O MÉTODO 'findByDataHoraBetween' DESTE ARQUIVO
}