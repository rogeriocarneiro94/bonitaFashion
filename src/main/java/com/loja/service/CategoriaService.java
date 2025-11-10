package com.loja.service;

import com.loja.entity.Categoria;
import com.loja.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Anotação que marca esta classe como um componente de serviço do Spring
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    // Injeção de Dependência via construtor (a melhor prática)
    @Autowired
    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    /**
     * Retorna uma lista de todas as categorias cadastradas.
     * @return Lista de Categorias.
     */
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    /**
     * Busca uma categoria específica pelo seu ID.
     * @param id O ID da categoria.
     * @return Um Optional contendo a Categoria, se encontrada.
     */
    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    /**
     * Salva uma nova categoria ou atualiza uma existente.
     * Futuramente, podemos adicionar regras de negócio aqui (ex: não permitir nomes duplicados).
     * @param categoria A categoria a ser salva.
     * @return A categoria salva (com o ID preenchido, se for nova).
     */
    public Categoria salvar(Categoria categoria) {
        // Lógica de negócio pode ser adicionada aqui antes de salvar
        return categoriaRepository.save(categoria);
    }

    /**
     * Deleta uma categoria pelo seu ID.
     * @param id O ID da categoria a ser deletada.
     */
    public void deletar(Long id) {
        categoriaRepository.deleteById(id);
    }
}