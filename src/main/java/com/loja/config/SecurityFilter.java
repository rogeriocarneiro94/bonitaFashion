package com.loja.config;

import com.loja.repository.FuncionarioRepository;
import com.loja.service.JwtService; // <--- Agora importamos a classe certa
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService; // <--- Injetando seu JwtService

    @Autowired
    private FuncionarioRepository repository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);

        if (token != null) {
            try {
                // Tenta extrair o usuário do token. Se o token for inválido/expirado, isso lança erro.
                var login = jwtService.extractUsername(token);

                if (login != null) {
                    // Busca o funcionário no banco
                    // OBS: O Funcionario precisa implementar UserDetails (ver passo 2)
                    UserDetails user = repository.findByLogin(login).orElse(null);

                    if (user != null) {
                        // Avisa o Spring Security que esse usuário está logado
                        var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                System.out.println("Token inválido ou expirado: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}