package com.loja.repository;

import com.loja.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    // Método para buscar um funcionário pelo seu login (username)
    Optional<Funcionario> findByLogin(String login);
}