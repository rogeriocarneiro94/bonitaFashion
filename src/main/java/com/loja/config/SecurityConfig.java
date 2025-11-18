package com.loja.config; // Verifique se este é o nome correto do seu pacote 'config'

import com.loja.config.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita o @PreAuthorize nos controllers
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * O Bean principal que configura toda a cadeia de segurança HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Configura o CORS usando o bean corsConfigurationSource()
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Desabilita o CSRF (desnecessário para APIs REST stateless)
                .csrf(csrf -> csrf.disable())

                // 3. Define as regras de autorização de URL
                .authorizeHttpRequests(authorize -> authorize
                        // Permite o endpoint de login
                        .requestMatchers("/api/auth/**").permitAll()

                        // (O FIX) Permite todas as requisições 'OPTIONS' (para o Preflight do CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Protege todas as outras requisições
                        .anyRequest().authenticated()
                )

                // 4. Define a política de sessão como STATELESS (não guarda estado no servidor)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. Define o provedor de autenticação (que usa nosso UserDetailsService)
                .authenticationProvider(authenticationProvider())

                // 6. Adiciona nosso filtro JWT para rodar antes do filtro padrão do Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Bean que configura o CORS para permitir que o frontend (React) acesse a API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Permite a origem do seu app React
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // Permite os métodos HTTP necessários
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Permite os cabeçalhos necessários (incluindo o de Autorização)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração a todas as rotas da API
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Expõe o AuthenticationManager como um Bean para ser usado no AuthenticationService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * O provedor de autenticação que diz ao Spring Security como buscar usuários
     * (usando nosso CustomUserDetailsService) e como verificar senhas (usando BCrypt).
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * O codificador de senhas (BCrypt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}