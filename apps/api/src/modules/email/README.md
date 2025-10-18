# EmailService

Serviço completo de envio de emails para o Estoque Mestre, com suporte a templates HTML e notificações automáticas.

## Funcionalidades

### ✅ Implementadas

- **Verificação de Email**: Envio de emails de verificação de conta
- **Reset de Senha**: Envio de links para redefinir senha
- **Aprovação/Rejeição de Empresa**: Notificações de status da empresa
- **Notificações por Email**: Sistema de notificações automáticas
- **Templates HTML**: Templates responsivos com Handlebars
- **Fallback para Console**: Logs no console quando SMTP não configurado
- **Teste de Conexão**: Endpoint para testar configuração de email

## Configuração

### Variáveis de Ambiente

```bash
# Configuração SMTP
EMAIL_SERVICE_HOST="smtp.gmail.com"
EMAIL_SERVICE_PORT=587
EMAIL_SERVICE_USER="your-email@gmail.com"
EMAIL_SERVICE_PASSWORD="your-app-password"
EMAIL_SERVICE_SECURE=false
EMAIL_FROM="Estoque Mestre <noreply@estoquemestre.com>"

# URLs da aplicação
FRONTEND_URL="http://localhost:4200"
```

### Configuração Gmail

1. Ative a verificação em 2 etapas
2. Gere uma senha de app
3. Use a senha de app no `EMAIL_SERVICE_PASSWORD`

## Endpoints

### Teste de Conexão
```http
GET /api/email/test-connection
Authorization: Bearer <token>
```

### Envio de Email de Teste
```http
POST /api/email/send-test
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

## Templates Disponíveis

### 1. Verificação de Email (`email-verification.hbs`)
- **Uso**: Verificação de conta de usuário
- **Dados**: `name`, `email`, `verificationLink`, `companyName`

### 2. Reset de Senha (`password-reset.hbs`)
- **Uso**: Redefinição de senha
- **Dados**: `name`, `email`, `resetLink`, `companyName`

### 3. Empresa Aprovada (`company-approved.hbs`)
- **Uso**: Notificação de aprovação de empresa
- **Dados**: `companyName`, `email`, `status`, `adminName`

### 4. Empresa Rejeitada (`company-rejected.hbs`)
- **Uso**: Notificação de rejeição de empresa
- **Dados**: `companyName`, `email`, `status`, `reason`, `adminName`

### 5. Notificação (`notification.hbs`)
- **Uso**: Notificações gerais do sistema
- **Dados**: `name`, `email`, `title`, `message`, `priority`, `actionUrl`, `companyName`

## Integração com Outros Módulos

### AuthService
- Envio automático de emails de verificação
- Envio de links de reset de senha

### CompanyService
- Notificações de aprovação/rejeição
- Emails de verificação de empresa

### NotificationService
- Envio automático de notificações por email
- Respeita preferências do usuário

## Exemplo de Uso

```typescript
// Injeção do serviço
constructor(private emailService: EmailService) {}

// Envio de verificação de email
await this.emailService.sendEmailVerification({
  name: 'João Silva',
  email: 'joao@example.com',
  verificationLink: 'https://app.com/verify?token=abc123',
  companyName: 'Minha Empresa'
});

// Envio de notificação
await this.emailService.sendNotificationEmail({
  name: 'João Silva',
  email: 'joao@example.com',
  title: 'Estoque Baixo',
  message: 'O produto X está com estoque baixo',
  priority: 'high',
  actionUrl: 'https://app.com/products/123',
  companyName: 'Minha Empresa'
});
```

## Logs e Monitoramento

- **Sucesso**: Logs de emails enviados com ID
- **Erro**: Logs detalhados de falhas
- **Fallback**: Logs no console quando SMTP não configurado
- **Verificação**: Teste de conexão disponível

## Segurança

- Validação de tokens de reset
- Expiração de links (1 hora para reset, 24 horas para verificação)
- Sanitização de dados nos templates
- Logs seguros (sem exposição de senhas)

## Status

✅ **COMPLETO** - EmailService totalmente implementado e funcional

