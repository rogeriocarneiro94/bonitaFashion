package com.loja.repository;

import com.loja.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    /**
     * Busca um cliente pelo seu CPF ou CNPJ.
     * O Spring Data JPA cria a query automaticamente.
     */
    Optional<Cliente> findByCpfCnpj(String cpfCnpj);
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}