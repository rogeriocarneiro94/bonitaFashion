// Local: src/main/java/com/loja/service/AuthenticationService.java
package com.loja.service;

import com.loja.dto.AuthRequest; // (Seu pacote)
import com.loja.dto.AuthResponse; // (Seu pacote)
import com.loja.repository.FuncionarioRepository; // (Seu pacote)
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final FuncionarioRepository repository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService; // Deve ser o CustomUserDetailsService

    // --- LÓGICA CORRIGIDA (Garante que UserDetails é usado para gerar o token) ---
    public AuthResponse login(AuthRequest request) {
        // 1. Autentica (verifica senha)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLogin(),
                        request.getSenha()
                )
        );

        // 2. Busca o usuário COM AS PERMISSÕES (chama o CustomUserDetailsService)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getLogin());

        // 3. Gera o token usando o UserDetails (que contém a ROLE_GERENTE)
        String token = jwtService.generateToken(userDetails);

        // 4. Retorna
        return new AuthResponse(token);
    }
}