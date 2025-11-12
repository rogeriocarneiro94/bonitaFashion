package com.loja.service;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor; // Use esta anotação
import org.springframework.security.core.GrantedAuthority; // IMPORTE ISTO
import org.springframework.security.core.authority.SimpleGrantedAuthority; // IMPORTE ISTO
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List; // IMPORTE ISTO

@Service
@RequiredArgsConstructor // Use esta anotação
public class CustomUserDetailsService implements UserDetailsService {

    private final FuncionarioRepository funcionarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Funcionario funcionario = funcionarioRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o login: " + username));

        String cargo = funcionario.getCargo() != null ? funcionario.getCargo().trim().toUpperCase() : "";

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + cargo)
        );

        return new User(
                funcionario.getLogin(),
                funcionario.getSenha(),
                authorities
        );
    }
}