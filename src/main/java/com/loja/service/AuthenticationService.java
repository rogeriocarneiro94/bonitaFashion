package com.loja.service;

import com.loja.dto.AuthRequest;
import com.loja.dto.AuthResponse;
import com.loja.repository.FuncionarioRepository;
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
    private final UserDetailsService userDetailsService;

    public AuthResponse login(AuthRequest request) {
        // 1. Autentica o usuário usando o AuthenticationManager do Spring
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLogin(),
                        request.getSenha()
                )
        );

        // 2. Se a autenticação foi bem-sucedida, busca os detalhes do usuário
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getLogin());

        // 3. Gera o token JWT para esse usuário
        String token = jwtService.generateToken(userDetails);

        // 4. Retorna o token
        return new AuthResponse(token);
    }
}