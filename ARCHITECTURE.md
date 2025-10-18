# Arquitetura do Sistema Estoque Mestre

## Visão Geral

O Estoque Mestre é um sistema de gerenciamento de estoque focado em autopeças, construído com arquitetura modular e multi-tenant.

## Stack Tecnológica

- **Backend**: NestJS + TypeScript
- **Frontend**: Angular + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Validação**: Zod
- **Autenticação**: JWT + Passport
- **Monorepo**: Turborepo + pnpm

## Arquitetura do Sistema

### Estrutura de Pastas

```
estoque_mestre/
├── apps/
│   ├── api/                 # API NestJS
│   └── front/               # Frontend Angular
├── packages/
│   ├── models/              # Modelos compartilhados
│   ├── ui/                  # Componentes UI
│   ├── eslint-config/       # Configurações ESLint
│   └── typescript-config/   # Configurações TypeScript
└── docs/                    # Documentação
```

### Hierarquia de Usuários

```
SUPER_ADMIN (Sistema)
├── ADMIN (Empresa 1) - Único por empresa
│   ├── MANAGER (Empresa 1)
│   └── MANAGER (Empresa 1)
├── ADMIN (Empresa 2) - Único por empresa
│   └── MANAGER (Empresa 2)
└── ADMIN (Empresa N)
```

### Modelo de Dados

#### Entidades Principais

1. **Company** - Empresas cadastradas
2. **User** - Usuários do sistema
3. **Product** - Produtos/peças
4. **Category** - Categorias hierárquicas
5. **Supplier** - Fornecedores
6. **Customer** - Clientes
7. **Transaction** - Transações (vendas/compras)
8. **InventoryMovement** - Movimentações de estoque

#### Relacionamentos

```
Company (1) ──→ (N) User
Company (1) ──→ (N) Product
Company (1) ──→ (N) Category
Company (1) ──→ (N) Supplier
Company (1) ──→ (N) Customer
Company (1) ──→ (N) Transaction

Category (1) ──→ (N) Product
Category (1) ──→ (N) Category (hierarquia)

Supplier (1) ──→ (N) Product
Supplier (1) ──→ (N) Transaction

Customer (1) ──→ (N) Transaction

Product (1) ──→ (N) TransactionItem
Product (1) ──→ (N) InventoryMovement

Transaction (1) ──→ (N) TransactionItem
Transaction (1) ──→ (N) TransactionPayment
Transaction (1) ──→ (N) InventoryMovement

User (1) ──→ (N) Transaction
User (1) ──→ (N) InventoryMovement
User (1) ──→ (N) AuditLog
```

## Fluxo de Dados

### 1. Autenticação e Autorização

```
Cliente → API → JWT Validation → Role Check → Resource Access
```

### 2. Operações CRUD

```
Request → DTO Validation (Zod) → Service → Repository → Database
Response ← DTO Transform ← Service ← Repository ← Database
```

### 3. Movimentação de Estoque

```
Transaction → InventoryMovement → Product Stock Update → Notification (if needed)
```

## Padrões de Design

### 1. Repository Pattern
- Abstração da camada de dados
- Facilita testes e manutenção

### 2. DTO Pattern
- Transferência de dados tipada
- Validação de entrada
- Transformação de saída

### 3. Factory Pattern
- Criação de entidades complexas
- Configuração de permissões

### 4. Observer Pattern
- Notificações automáticas
- Auditoria de ações

## Segurança

### 1. Autenticação
- JWT tokens com refresh
- Sessões gerenciadas
- Logout automático

### 2. Autorização
- Role-based access control (RBAC)
- Permissões granulares
- Isolamento por empresa

### 3. Validação
- Zod schemas para validação
- Sanitização de entrada
- Proteção contra SQL injection (Prisma)

### 4. Auditoria
- Log de todas as ações
- Rastreabilidade completa
- Compliance

## Performance

### 1. Banco de Dados
- Índices otimizados
- Queries eficientes
- Paginação automática

### 2. Cache
- Redis para sessões
- Cache de consultas frequentes
- Invalidação inteligente

### 3. API
- Rate limiting
- Compressão de resposta
- Lazy loading

## Escalabilidade

### 1. Horizontal
- Microserviços preparados
- Load balancing
- Database sharding

### 2. Vertical
- Otimização de queries
- Cache strategies
- Resource monitoring

## Monitoramento

### 1. Logs
- Structured logging
- Error tracking
- Performance metrics

### 2. Alertas
- Sistema de notificações
- Thresholds configuráveis
- Escalation policies

## Deployment

### 1. Desenvolvimento
```bash
pnpm install
pnpm dev
```

### 2. Produção
```bash
pnpm build
pnpm start:prod
```

### 3. Docker
- Containerização completa
- Multi-stage builds
- Health checks

## Manutenção

### 1. Migrações
- Prisma migrations
- Versionamento de schema
- Rollback automático

### 2. Backup
- Backup automático
- Point-in-time recovery
- Cross-region replication

### 3. Updates
- Zero-downtime deployments
- Feature flags
- A/B testing

## Roadmap

### Fase 1 - MVP ✅
- [x] Estrutura base
- [x] Modelos de dados
- [x] Autenticação
- [x] CRUD básico

### Fase 2 - Funcionalidades
- [ ] API endpoints
- [ ] Frontend básico
- [ ] Relatórios
- [ ] Notificações

### Fase 3 - Avançado
- [ ] Analytics
- [ ] Integrações
- [ ] Mobile app
- [ ] AI/ML features

### Fase 4 - Enterprise
- [ ] Multi-tenant avançado
- [ ] White-label
- [ ] API marketplace
- [ ] Compliance avançado







