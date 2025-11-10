package com.loja.service;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final FuncionarioRepository funcionarioRepository;

    @Autowired
    public CustomUserDetailsService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Busca o funcionário no banco de dados pelo login
        Funcionario funcionario = funcionarioRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o login: " + username));

        // 2. Cria um objeto UserDetails (do Spring Security) com os dados do funcionário
        // Por enquanto, não estamos usando roles (perfis de acesso), então passamos uma lista vazia.
        return new User(
                funcionario.getLogin(),
                funcionario.getSenha(),
                Collections.emptyList() // Autoridades/Perfis (Roles)
        );
    }
}