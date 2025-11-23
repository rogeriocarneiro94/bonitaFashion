// Local: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function LoginPage() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await api.post('/auth/login', { login, senha });

        // AQUI ESTÁ O SEGREDO:
        // O backend agora manda { token, nome, perfil }
        const { token, nome, perfil } = response.data;

        // Salvamos no navegador
        localStorage.setItem('token', token);
        localStorage.setItem('usuario_nome', nome);   // <--- Salva o Nome
        localStorage.setItem('usuario_perfil', perfil); // <--- Salva o Perfil

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success(`Bem-vindo, ${nome}!`);

        // Força um recarregamento ou navega
        window.location.href = "/dashboard";

      } catch (error) {
        toast.error('Login ou senha inválidos.');
      }
    };

  return (
    // 2. Adicione a classe para o container da página
    <div className="login-page-container">
      {/* 3. Adicione a classe para o card do formulário */}
      <div className="login-form-card">
        <h2>Login - Bonita Fashion</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;