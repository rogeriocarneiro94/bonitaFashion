package com.loja.service;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public FuncionarioService(FuncionarioRepository funcionarioRepository, PasswordEncoder passwordEncoder) {
        this.funcionarioRepository = funcionarioRepository;
        this.passwordEncoder = passwordEncoder; // Injetamos o codificador de senhas
    }

    public Funcionario salvar(Funcionario funcionario) {
        // REGRA DE NEGÓCIO CRÍTICA: Criptografar a senha antes de salvar!
        String senhaCriptografada = passwordEncoder.encode(funcionario.getSenha());
        funcionario.setSenha(senhaCriptografada);

        return funcionarioRepository.save(funcionario);
    }

    // ... outros métodos como listar, buscarPorId, etc.
}