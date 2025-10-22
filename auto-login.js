// Script para fazer login automático no frontend
// Execute este script no console do navegador quando estiver em http://localhost:4200

console.log('Iniciando login automático...');

// Dados de login
const loginData = {
  email: 'admin@estoquemestre.com',
  password: '123456'
};

// Fazer login
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
    console.log('✅ Login realizado com sucesso!');
    
    // Armazenar dados no localStorage
    localStorage.setItem('auth_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    localStorage.setItem('auth_user', JSON.stringify(data.data.user));
    
    console.log('✅ Tokens armazenados no localStorage');
    console.log('🔄 Recarregando a página...');
    
    // Recarregar a página
    window.location.reload();
  } else {
    console.error('❌ Erro no login:', data);
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});
