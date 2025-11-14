// Local: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './LoginPage.css'; // <-- 1. IMPORTE O NOVO CSS

function LoginPage() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); // Impede o recarregamento da página
    setError(''); // Limpa mensagens de erro anteriores

    try {
      const response = await api.post('/auth/login', { login, senha });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard'); // Redireciona para o dashboard após o login
    } catch (err) {
      // Exibe uma mensagem de erro mais amigável
      setError('Login ou senha inválidos. Tente novamente.');
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