import axios from 'axios';

// Cria uma instância "base" do axios
const api = axios.create({
  baseURL: 'http://localhost:9090/api' // A URL base da sua API
});

// "Interceptador" de Requisições
// Esta função é executada ANTES de CADA requisição sair do frontend
api.interceptors.request.use(
  (config) => {
    // 1. Pega o token do localStorage
    const token = localStorage.getItem('token');

    // 2. Se o token existir, adiciona ele aos cabeçalhos
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Retorna a configuração modificada para o axios continuar a requisição
    return config;
  },
  (error) => {
    // Faz algo se der erro na montagem da requisição
    return Promise.reject(error);
  }
);

export default api;