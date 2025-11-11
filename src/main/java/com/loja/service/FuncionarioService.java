package com.loja.service;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor; // Use esta anotação do Lombok
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Substitui o @Autowired no construtor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Funcionario salvar(Funcionario funcionario) {
        // REGRA DE NEGÓCIO CRÍTICA: Criptografar a senha antes de salvar!
        String senhaCriptografada = passwordEncoder.encode(funcionario.getSenha());
        funcionario.setSenha(senhaCriptografada);

        return funcionarioRepository.save(funcionario);
    }

    // --- NOVOS MÉTODOS ADICIONADOS ---

    /**
     * Lista todos os funcionários cadastrados.
     * @return Lista de Funcionários.
     */
    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    /**
     * Busca um funcionário específico pelo seu ID.
     * @param id O ID do funcionário.
     * @return Um Optional contendo o Funcionário, se encontrado.
     */
    public Optional<Funcionario> buscarPorId(Long id) {
        return funcionarioRepository.findById(id);
    }

    /**
     * Deleta um funcionário pelo seu ID.
     * @param id O ID do funcionário a ser deletado.
     */
    public void deletar(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new IllegalStateException("Funcionário com ID " + id + " não encontrado.");
        }
        funcionarioRepository.deleteById(id);
    }
}