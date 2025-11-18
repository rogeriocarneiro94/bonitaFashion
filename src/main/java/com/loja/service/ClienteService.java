package com.loja.service;

import com.loja.entity.Cliente;
import com.loja.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class  ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente salvar(Cliente cliente) {
        // --- REGRA DE NEGÓCIO: Validar CPF/CNPJ duplicado ---
        Optional<Cliente> clienteExistente = clienteRepository.findByCpfCnpj(cliente.getCpfCnpj());

        if (clienteExistente.isPresent() && !clienteExistente.get().getId().equals(cliente.getId())) {
            // Se encontrou um cliente, e o ID dele é DIFERENTE do ID que estamos salvando
            // (ou seja, não estamos apenas atualizando o mesmo cliente)
            throw new IllegalStateException("CPF/CNPJ já cadastrado para outro cliente.");
        }

        return clienteRepository.save(cliente);
    }

    public void deletar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new IllegalStateException("Cliente com ID " + id + " não encontrado.");
        }
        clienteRepository.deleteById(id);
    }

    public List<Cliente> buscarPorNome(String nome) {
        return clienteRepository.findByNomeContainingIgnoreCase(nome);
    }
}