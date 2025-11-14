// Local: src/main/java/com/loja/service/CustomUserDetailsService.java
package com.loja.service;

import com.loja.entity.Funcionario; // (Seu pacote)
import com.loja.repository.FuncionarioRepository; // (Seu pacote)
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

// Local: src/main/java/com/loja/service/CustomUserDetailsService.java
// ... (imports) ...

@Service
@RequiredArgsConstructor
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

        // =================================================================
        // ADICIONE ESTAS DUAS LINHAS DE DEBUG:
        System.out.println("=========================================");
        System.out.println("USUÁRIO LOGADO: " + username + " | CARGO LIDO: " + funcionario.getCargo() + " | PERMISSÕES GERADAS: " + authorities);
        // =================================================================

        return new User(
                funcionario.getLogin(),
                funcionario.getSenha(),
                authorities
        );
    }
}