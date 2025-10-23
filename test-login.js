// Script para testar login no frontend
// Execute este script no console do navegador quando estiver em http://localhost:4200

// Simular login
const loginData = {
  email: 'admin@estoquemestre.com',
  password: '123456'
};

// Fazer login via fetch
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Login realizado com sucesso!');
    console.log('Token:', data.data.access_token);
    
    // Armazenar token no localStorage
    localStorage.setItem('auth_token', data.data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.data.user));
    
    console.log('Token armazenado no localStorage');
    console.log('Agora recarregue a página para testar as rotas protegidas');
  } else {
    console.error('Erro no login:', data);
  }
})
.catch(error => {
  console.error('Erro na requisição:', error);
});
