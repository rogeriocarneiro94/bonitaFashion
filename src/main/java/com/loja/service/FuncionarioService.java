package com.loja.service;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Funcionario criarFuncionario(Funcionario funcionario) {
        if (funcionarioRepository.findByLogin(funcionario.getLogin()).isPresent()) {
            throw new RuntimeException("Login já existe!");
        }

        // Criptografa a senha nova
        funcionario.setSenha(passwordEncoder.encode(funcionario.getSenha()));

        if (funcionario.getPerfil() == null || funcionario.getPerfil().isEmpty()) {
            funcionario.setPerfil("USER");
        }

        return funcionarioRepository.save(funcionario);
    }

    // --- MÉTODO DE ATUALIZAÇÃO INTELIGENTE ---
    public Funcionario atualizar(Long id, Funcionario dadosNovos) {
        Funcionario funcionarioExistente = funcionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        // Atualiza os dados básicos
        funcionarioExistente.setNome(dadosNovos.getNome());
        funcionarioExistente.setLogin(dadosNovos.getLogin());
        funcionarioExistente.setPerfil(dadosNovos.getPerfil());
        funcionarioExistente.setDataAdmissao(dadosNovos.getDataAdmissao());

        // Lógica da Senha: Só altera se o usuário digitou algo novo
        if (dadosNovos.getSenha() != null && !dadosNovos.getSenha().isEmpty()) {
            funcionarioExistente.setSenha(passwordEncoder.encode(dadosNovos.getSenha()));
        }
        // Se vier nula ou vazia, mantemos a 'funcionarioExistente.getSenha()' antiga

        return funcionarioRepository.save(funcionarioExistente);
    }

    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    public Optional<Funcionario> buscarPorId(Long id) {
        return funcionarioRepository.findById(id);
    }

    public void deletar(Long id) {
        funcionarioRepository.deleteById(id);
    }
}