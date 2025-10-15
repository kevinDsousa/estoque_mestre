# Fluxos de Negócio - Estoque Mestre

## 📋 Visão Geral

Este documento detalha todos os fluxos de negócio do sistema Estoque Mestre, desde o cadastro da empresa até a gestão completa do estoque.

## 🏢 Fluxo de Cadastro e Aprovação de Empresa

### 1. **Cadastro Inicial da Empresa**

```mermaid
graph TD
    A[Empresa acessa site] --> B[Preenche dados básicos]
    B --> C[Envia CNPJ + dados]
    C --> D[Sistema valida CNPJ]
    D --> E[Envia código por email]
    E --> F[Usuário confirma código]
    F --> G[Cadastra senha]
    G --> H[Status: EM_ANALISE]
    H --> I[Admin recebe notificação]
```

**Dados Obrigatórios**:
- Nome da empresa
- CNPJ (validado)
- Email do responsável
- Telefone
- Endereço completo
- Nome do responsável

**Validações**:
- CNPJ deve ser válido e único
- Email deve ser único
- Telefone deve ser válido
- Endereço deve ser completo

### 2. **Processo de Aprovação**

```mermaid
graph TD
    A[Admin recebe notificação] --> B[Acessa painel admin]
    B --> C[Visualiza dados da empresa]
    C --> D{Decisão}
    D -->|Aprovar| E[Status: APROVADO]
    D -->|Rejeitar| F[Status: REJEITADO]
    E --> G[Email de aprovação]
    F --> H[Email de rejeição]
    G --> I[Empresa pode acessar]
    H --> J[Processo finalizado]
```

**Critérios de Aprovação**:
- CNPJ válido e ativo
- Dados completos e consistentes
- Email válido e acessível
- Não estar em lista de bloqueio

## 💳 Fluxo de Pagamento e Assinatura

### 1. **Configuração de Pagamento**

```mermaid
graph TD
    A[Empresa aprovada] --> B[Escolhe plano]
    B --> C[Configura pagamento]
    C --> D[Stripe processa]
    D --> E{Pagamento OK?}
    E -->|Sim| F[Assinatura ativa]
    E -->|Não| G[Notificação de erro]
    F --> H[Email de confirmação]
    G --> I[Tenta novamente]
```

**Plano Atual**:
- **Valor**: R$ 150,00/mês
- **Método**: Cartão de crédito
- **Recorrência**: Mensal
- **Trial**: 7 dias grátis

### 2. **Controle de Inadimplência**

```mermaid
graph TD
    A[Vencimento do pagamento] --> B{Pagamento em dia?}
    B -->|Sim| C[Continua ativo]
    B -->|Não| D[Dia 1-10: Aviso]
    D --> E[Usuário vê aviso ao logar]
    E --> F[Dia 11: Bloqueio automático]
    F --> G[Email de bloqueio]
    G --> H[Usuário não consegue acessar]
    H --> I[Pagamento realizado]
    I --> J[Desbloqueio automático]
```

**Regras de Bloqueio**:
- **Dias 1-10**: Aviso visual no sistema
- **Dia 11**: Bloqueio automático
- **Após pagamento**: Desbloqueio imediato
- **Tentativas**: Máximo 3 tentativas de cobrança

## 📦 Fluxo de Gestão de Produtos

### 1. **Cadastro de Produto**

```mermaid
graph TD
    A[Usuário acessa 'Novo Produto'] --> B[Preenche dados básicos]
    B --> C[Seleciona categoria]
    C --> D[Define preços]
    D --> E[Configura estoque]
    E --> F[Upload de imagens]
    F --> G[Preview das imagens]
    G --> H[Salva produto]
    H --> I[Produto criado]
```

**Dados do Produto**:
- Nome e descrição
- SKU (único por empresa)
- Código de barras (opcional)
- Categoria
- Preço de custo e venda
- Estoque inicial e mínimo
- Especificações técnicas
- Imagens (máximo 5)

### 2. **Upload e Gestão de Imagens**

```mermaid
graph TD
    A[Usuário seleciona imagens] --> B[Validação de formato]
    B --> C[Validação de tamanho]
    C --> D[Upload para MinIO]
    D --> E[Processamento automático]
    E --> F[Geração de variantes]
    F --> G[Armazenamento no banco]
    G --> H[Preview no frontend]
```

**Limites de Imagem**:
- **Máximo**: 5 imagens por produto
- **Tamanho**: 10MB por imagem
- **Formatos**: JPG, PNG, WebP
- **Variantes**: Thumbnail, Small, Medium, Large, Original

### 3. **Movimentação de Estoque**

```mermaid
graph TD
    A[Usuário registra movimentação] --> B[Seleciona tipo]
    B --> C[Escolhe produtos]
    C --> D[Define quantidades]
    D --> E[Informa motivo]
    E --> F[Confirma movimentação]
    F --> G[Atualiza estoque]
    G --> H[Registra histórico]
    H --> I[Verifica alertas]
```

**Tipos de Movimentação**:
- **Entrada**: Compra, devolução, ajuste positivo
- **Saída**: Venda, perda, ajuste negativo
- **Transferência**: Entre locais
- **Inventário**: Contagem física

## 🔍 Fluxo de Relatórios e Analytics

### 1. **Geração de Relatórios**

```mermaid
graph TD
    A[Usuário acessa relatórios] --> B[Seleciona tipo]
    B --> C[Define período]
    C --> D[Escolhe filtros]
    D --> E[Gera relatório]
    E --> F[Processa dados]
    F --> G[Exibe resultados]
    G --> H[Opção de exportar]
```

**Tipos de Relatório**:
- **Estoque**: Produtos em estoque, baixo estoque
- **Movimentação**: Entradas e saídas
- **Vendas**: Produtos mais vendidos
- **Financeiro**: Margem de lucro, custos
- **Fornecedores**: Performance de fornecedores

### 2. **Dashboard Executivo**

```mermaid
graph TD
    A[Usuário acessa dashboard] --> B[Carrega métricas]
    B --> C[Calcula indicadores]
    C --> D[Atualiza gráficos]
    D --> E[Exibe resumo]
    E --> F[Alertas importantes]
    F --> G[Dashboard completo]
```

**Métricas Principais**:
- Total de produtos
- Valor do estoque
- Produtos com estoque baixo
- Movimentações do dia
- Receita do período

## 👥 Fluxo de Gestão de Usuários

### 1. **Cadastro de Usuário**

```mermaid
graph TD
    A[Admin cria usuário] --> B[Preenche dados]
    B --> C[Define permissões]
    C --> D[Envia convite]
    D --> E[Usuário recebe email]
    E --> F[Usuário define senha]
    F --> G[Usuário ativo]
```

**Tipos de Usuário**:
- **Admin**: Acesso total ao sistema
- **Business**: Acesso limitado à empresa
- **Viewer**: Apenas visualização
- **Operator**: Operações básicas

### 2. **Controle de Permissões**

```mermaid
graph TD
    A[Usuário tenta ação] --> B[Verifica permissão]
    B --> C{Tem permissão?}
    C -->|Sim| D[Executa ação]
    C -->|Não| E[Bloqueia acesso]
    D --> F[Registra auditoria]
    E --> G[Log de tentativa]
```

## 🔐 Fluxo de Autenticação e Segurança

### 1. **Login do Usuário**

```mermaid
graph TD
    A[Usuário acessa login] --> B[Insere credenciais]
    B --> C[Valida dados]
    C --> D{Usuário válido?}
    D -->|Sim| E[Verifica status]
    D -->|Não| F[Erro de login]
    E --> G{Status ativo?}
    G -->|Sim| H[Gera JWT]
    G -->|Não| I[Bloqueia acesso]
    H --> J[Login realizado]
    I --> K[Usuário bloqueado]
```

### 2. **Controle de Sessão**

```mermaid
graph TD
    A[Usuário autenticado] --> B[Acessa recurso]
    B --> C[Verifica JWT]
    C --> D{Token válido?}
    D -->|Sim| E[Verifica permissões]
    D -->|Não| F[Redireciona login]
    E --> G{Tem permissão?}
    G -->|Sim| H[Acesso liberado]
    G -->|Não| I[Acesso negado]
```

## 📱 Fluxo de Notificações

### 1. **Sistema de Alertas**

```mermaid
graph TD
    A[Evento ocorre] --> B[Verifica regras]
    B --> C{Deve notificar?}
    C -->|Sim| D[Gera notificação]
    C -->|Não| E[Ignora evento]
    D --> F[Envia email]
    D --> G[Notificação in-app]
    F --> H[Usuário recebe]
    G --> I[Usuário vê no sistema]
```

**Tipos de Notificação**:
- **Estoque baixo**: Produtos com estoque mínimo
- **Pagamento**: Lembretes de vencimento
- **Sistema**: Manutenções, atualizações
- **Segurança**: Tentativas de acesso

## 🔄 Fluxo de Backup e Recuperação

### 1. **Backup Automático**

```mermaid
graph TD
    A[Agendamento diário] --> B[Inicia backup]
    B --> C[Backup do banco]
    C --> D[Backup das imagens]
    D --> E[Verifica integridade]
    E --> F[Armazena backup]
    F --> G[Notifica sucesso]
```

### 2. **Recuperação de Dados**

```mermaid
graph TD
    A[Necessidade de recuperação] --> B[Seleciona backup]
    B --> C[Verifica integridade]
    C --> D[Restaura banco]
    D --> E[Restaura imagens]
    E --> F[Valida dados]
    F --> G[Sistema restaurado]
```

## 📊 Fluxo de Analytics e Métricas

### 1. **Coleta de Dados**

```mermaid
graph TD
    A[Usuário interage] --> B[Registra evento]
    B --> C[Envia para analytics]
    C --> D[Processa dados]
    D --> E[Gera métricas]
    E --> F[Atualiza dashboard]
```

**Métricas Coletadas**:
- Ações do usuário
- Tempo de sessão
- Produtos mais acessados
- Funcionalidades mais usadas
- Performance do sistema

---

Estes fluxos garantem que o sistema Estoque Mestre funcione de forma eficiente, segura e intuitiva para todos os usuários.
