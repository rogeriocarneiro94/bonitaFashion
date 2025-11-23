package com.loja.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@Table(name = "funcionarios")
public class Funcionario implements UserDetails { // <--- IMPLEMENTA A INTERFACE

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String login;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String perfil = "USER";

    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    // --- MÉTODOS OBRIGATÓRIOS DO SPRING SECURITY ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Se for ADMIN, ganha permissão de admin E usuário
        if ("ADMIN".equalsIgnoreCase(this.perfil)) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        }
        // Se não, só usuário
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}