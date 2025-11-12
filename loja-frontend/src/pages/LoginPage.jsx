import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function LoginPage() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dadosLogin = {
      login: login,
      senha: senha,
    };

    try {
      // 1. Faz a chamada para o backend
      const response = await axios.post('http://localhost:9090/api/auth/login', dadosLogin);

      // 2. Salva o token
      localStorage.setItem('token', response.data.token);

      alert('Login bem-sucedido!');

      // 3. Redireciona o usuário para o dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro: Login ou senha incorretos.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Login - Bonita Fashion</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Login:</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
      </header>
    </div>
  );
}

export default LoginPage;