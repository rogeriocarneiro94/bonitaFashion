package com.loja;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import com.loja.service.FuncionarioService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate; // <--- Importe

@SpringBootApplication
public class BonitaFashionApplication {

    public static void main(String[] args) {
        SpringApplication.run(BonitaFashionApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CommandLineRunner initialData(FuncionarioService funcionarioService, FuncionarioRepository funcionarioRepository) {
        return args -> {
            if (funcionarioRepository.findByLogin("admin").isEmpty()) {
                System.out.println("--- Criando usuário administrador padrão ---");

                Funcionario admin = new Funcionario();
                admin.setNome("Administrador do Sistema");
                admin.setLogin("admin");
                admin.setSenha("123");
                admin.setPerfil("ADMIN");

                // --- AQUI ESTÁ A CORREÇÃO ---
                admin.setDataAdmissao(LocalDate.now());

                funcionarioService.criarFuncionario(admin);
                System.out.println("--- Admin criado! Login: admin / Senha: 123 ---");
            }
        };
    }
}