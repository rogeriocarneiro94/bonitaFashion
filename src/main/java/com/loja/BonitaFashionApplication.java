package com.loja;

import com.loja.entity.Funcionario;
import com.loja.repository.FuncionarioRepository;
import com.loja.service.FuncionarioService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class BonitaFashionApplication {

	public static void main(String[] args) {
		SpringApplication.run(BonitaFashionApplication.class, args);
	}

    // Dentro da sua classe LojaApplication.java ou DemoApplication.java

    @Bean
    public CommandLineRunner initialData(FuncionarioService funcionarioService, FuncionarioRepository funcionarioRepository) {
        return args -> {
            // Verifica se já existe um usuario admin para não criar duplicado
            if (funcionarioRepository.findByLogin("admin").isEmpty()) {
                System.out.println("Criando usuário administrador padrão...");
                Funcionario admin = new Funcionario();
                admin.setNome("Administrador");
                admin.setCpf("000.000.000-00");
                admin.setCargo("Gerente");
                admin.setLogin("admin");
                admin.setSenha("123"); // A senha em texto puro que será criptografada pelo serviço
                admin.setDataAdmissao(LocalDate.now());


                funcionarioService.salvar(admin);
                System.out.println("Usuário administrador criado com sucesso!");
            }
        };
    }
}


