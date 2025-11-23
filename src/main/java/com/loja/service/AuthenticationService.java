package com.loja.service;

import com.loja.dto.AuthRequest;
import com.loja.dto.AuthResponse;
import com.loja.entity.Funcionario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        // 1. Autentica (verifica senha). Se falhar, o Spring lança erro aqui.
        var usernamePassword = new UsernamePasswordAuthenticationToken(
                request.getLogin(),
                request.getSenha()
        );

        var auth = authenticationManager.authenticate(usernamePassword);

        // 2. Pega o usuário logado (Casting para sua entidade Funcionario)
        // Isso funciona porque sua classe Funcionario implementa UserDetails
        var usuario = (Funcionario) auth.getPrincipal();

        // 3. Gera o token
        String token = jwtService.generateToken(usuario);

        // 4. Retorna Token + Nome + Perfil
        return new AuthResponse(token, usuario.getNome(), usuario.getPerfil());
    }
}