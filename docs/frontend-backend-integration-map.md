# Mapa de Integração Frontend ↔ Backend - Estoque Mestre

**Data**: 20/10/2024  
**Status**: Em Desenvolvimento  
**Versão**: 1.0

## 📋 Resumo Executivo

Este documento mapeia todos os CRUDs, rotas, componentes e services que precisam ser integrados entre o frontend Angular e o backend NestJS do sistema Estoque Mestre.

---

## 🎯 **STATUS ATUAL**

### ✅ **FRONTEND SERVICES (JÁ CRIADOS)**
- ✅ `ApiService` - Serviço base para comunicação HTTP
- ✅ `AuthService` - Autenticação e autorização
- ✅ `ProductService` - CRUD de produtos
- ✅ `CategoryService` - CRUD de categorias
- ✅ `SupplierService` - CRUD de fornecedores
- ✅ `CustomerService` - CRUD de clientes
- ✅ `TransactionService` - CRUD de transações
- ✅ `UserService` - CRUD de usuários
- ✅ `ReportsService` - Relatórios e analytics
- ✅ `ImageService` - Upload de imagens
- ✅ `NotificationService` - Notificações
- ✅ `PaymentService` - Pagamentos
- ✅ `CompanyService` - Gestão de empresa

### ✅ **BACKEND MODULES (JÁ CRIADOS)**
- ✅ `ProductModule` - CRUD de produtos
- ✅ `CategoryModule` - CRUD de categorias
- ✅ `SupplierModule` - CRUD de fornecedores
- ✅ `CustomerModule` - CRUD de clientes
- ✅ `TransactionModule` - CRUD de transações
- ✅ `UserModule` - CRUD de usuários
- ✅ `ReportsModule` - Relatórios e analytics
- ✅ `ImageModule` - Upload de imagens
- ✅ `NotificationModule` - Notificações
- ✅ `PaymentModule` - Pagamentos
- ✅ `CompanyModule` - Gestão de empresa
- ✅ `EmailModule` - Envio de emails
- ✅ `AdminModule` - Administração

---

## 🔄 **MAPEAMENTO DE INTEGRAÇÃO**

### **1. AUTENTICAÇÃO E AUTORIZAÇÃO**

#### **Frontend Components:**
- `LoginComponent` (`/login`)
- `RegisterComponent` (`/register`)
- `ProfileComponent` (`/profile`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/auth.service.ts
AuthService {
  login(credentials: LoginRequest): Observable<LoginResponse>
  register(data: RegisterRequest): Observable<UserResponse>
  logout(): void
  refreshToken(): Observable<RefreshTokenResponse>
  changePassword(data: ChangePasswordRequest): Observable<void>
  resetPassword(email: string): Observable<void>
  updateProfile(data: UpdateProfileRequest): Observable<UserResponse>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/auth/auth.controller.ts
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/change-password
POST /api/auth/reset-password
POST /api/auth/confirm-reset-password
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Integração não testada**
- ❌ **AuthContext não funciona** (userId: 'system')

---

### **2. PRODUTOS**

#### **Frontend Components:**
- `ProductsComponent` (`/produtos`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/product.service.ts
ProductService {
  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<ProductListResponse>>
  getProduct(id: string): Observable<ProductResponse>
  createProduct(data: CreateProductRequest): Observable<ProductResponse>
  updateProduct(id: string, data: UpdateProductRequest): Observable<ProductResponse>
  deleteProduct(id: string): Observable<void>
  adjustStock(id: string, data: InventoryAdjustmentRequest): Observable<void>
  getProductStats(): Observable<ProductStats>
  searchProducts(query: ProductSearchRequest): Observable<ProductListResponse[]>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/product/product.controller.ts
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/adjust-stock
POST   /api/products/:id/transfer-stock
GET    /api/products/stats
GET    /api/products/search
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**
- ❌ **Upload de imagens não integrado**

---

### **3. CATEGORIAS**

#### **Frontend Components:**
- `CategoriesComponent` (`/categorias`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/category.service.ts
CategoryService {
  getCategories(): Observable<CategoryResponse[]>
  getCategory(id: string): Observable<CategoryResponse>
  createCategory(data: CreateCategoryRequest): Observable<CategoryResponse>
  updateCategory(id: string, data: UpdateCategoryRequest): Observable<CategoryResponse>
  deleteCategory(id: string): Observable<void>
  moveCategory(id: string, data: MoveCategoryRequest): Observable<void>
  getCategoryTree(): Observable<CategoryTreeResponse[]>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/category/category.controller.ts
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
POST   /api/categories/:id/move
GET    /api/categories/tree
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

### **4. FORNECEDORES**

#### **Frontend Components:**
- `SuppliersComponent` (`/fornecedores`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/supplier.service.ts
SupplierService {
  getSuppliers(filters?: SupplierFilters): Observable<PaginatedResponse<SupplierListResponse>>
  getSupplier(id: string): Observable<SupplierResponse>
  createSupplier(data: CreateSupplierRequest): Observable<SupplierResponse>
  updateSupplier(id: string, data: UpdateSupplierRequest): Observable<SupplierResponse>
  deleteSupplier(id: string): Observable<void>
  getSupplierProducts(id: string): Observable<ProductListResponse[]>
  getSupplierStats(): Observable<SupplierStats>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/supplier/supplier.controller.ts
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PATCH  /api/suppliers/:id
DELETE /api/suppliers/:id
GET    /api/suppliers/:id/products
GET    /api/suppliers/stats
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

### **5. CLIENTES**

#### **Frontend Components:**
- `CustomersComponent` (`/clientes`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/customer.service.ts
CustomerService {
  getCustomers(filters?: CustomerFilters): Observable<PaginatedResponse<CustomerListResponse>>
  getCustomer(id: string): Observable<CustomerResponse>
  createCustomer(data: CreateCustomerRequest): Observable<CustomerResponse>
  updateCustomer(id: string, data: UpdateCustomerRequest): Observable<CustomerResponse>
  deleteCustomer(id: string): Observable<void>
  getCustomerTransactions(id: string): Observable<TransactionListResponse[]>
  getCustomerStats(): Observable<CustomerStats>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/customer/customer.controller.ts
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/transactions
GET    /api/customers/stats
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

### **6. TRANSAÇÕES**

#### **Frontend Components:**
- `TransactionsComponent` (`/transacoes`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/transaction.service.ts
TransactionService {
  getTransactions(filters?: TransactionFilters): Observable<PaginatedResponse<TransactionListResponse>>
  getTransaction(id: string): Observable<TransactionResponse>
  createTransaction(data: CreateTransactionRequest): Observable<TransactionResponse>
  updateTransaction(id: string, data: UpdateTransactionRequest): Observable<TransactionResponse>
  deleteTransaction(id: string): Observable<void>
  getTransactionStats(): Observable<TransactionStats>
  processPayment(id: string, data: PaymentRequest): Observable<PaymentResponse>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/transaction/transaction.controller.ts
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/stats
POST   /api/transactions/:id/process-payment
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

### **7. RELATÓRIOS**

#### **Frontend Components:**
- `ReportsComponent` (`/relatorios`)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/reports.service.ts
ReportsService {
  getSalesReport(filters: SalesReportFilters): Observable<SalesReportResponse>
  getInventoryReport(filters: InventoryReportFilters): Observable<InventoryReportResponse>
  getFinancialReport(filters: FinancialReportFilters): Observable<FinancialReportResponse>
  getCustomerReport(filters: CustomerReportFilters): Observable<CustomerReportResponse>
  getSupplierReport(filters: SupplierReportFilters): Observable<SupplierReportResponse>
  exportReport(type: string, filters: any): Observable<Blob>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/reports/reports.controller.ts
GET    /api/reports/sales
GET    /api/reports/inventory
GET    /api/reports/financial
GET    /api/reports/customers
GET    /api/reports/suppliers
GET    /api/reports/export/:type
```

#### **Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

### **8. UPLOAD DE IMAGENS**

#### **Frontend Components:**
- `ProductsComponent` (modal de upload)

#### **Frontend Service:**
```typescript
// apps/front/src/app/core/services/image.service.ts
ImageService {
  uploadImage(file: File): Observable<ImageUploadResponse>
  uploadMultipleImages(files: File[]): Observable<ImageUploadResponse[]>
  deleteImage(id: string): Observable<void>
  getImage(id: string): Observable<ImageResponse>
  updateImage(id: string, data: UpdateImageRequest): Observable<ImageResponse>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/image/image.controller.ts
POST   /api/images/upload
POST   /api/images/upload-multiple
DELETE /api/images/:id
GET    /api/images/:id
PATCH  /api/images/:id
```

#### **Status**: ❌ **NÃO INTEGRADO**
- ✅ Frontend service criado
- ✅ Backend endpoints existem
- ❌ **Upload não conectado com backend**
- ❌ **MinIO não configurado**

---

### **9. DASHBOARD**

#### **Frontend Components:**
- `DashboardComponent` (`/dashboard`)

#### **Frontend Service:**
```typescript
// Usa múltiplos services
DashboardService {
  getDashboardStats(): Observable<DashboardStatsResponse>
  getQuickStats(): Observable<QuickStatsResponse>
  getRecentActivity(): Observable<ActivityResponse[]>
  getLowStockProducts(): Observable<ProductListResponse[]>
  getPendingOrders(): Observable<TransactionListResponse[]>
}
```

#### **Backend Endpoints:**
```typescript
// apps/api/src/modules/admin/admin.controller.ts
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/quick-stats
GET    /api/admin/dashboard/recent-activity
GET    /api/admin/dashboard/low-stock
GET    /api/admin/dashboard/pending-orders
```

#### **Status**: ❌ **NÃO INTEGRADO**
- ❌ **DashboardService não existe**
- ✅ Backend endpoints existem
- ❌ **Componente usa dados MOCK**

---

## 🚨 **PROBLEMAS CRÍTICOS IDENTIFICADOS**

### **1. AUTHCONTEXT NÃO FUNCIONA**
```typescript
// apps/api/src/modules/product/product.service.ts
userId: 'system', // TODO: Get from auth context
```
**Impacto**: Todas as operações usam userId hardcoded

### **2. COMPONENTES USAM DADOS MOCK**
```typescript
// apps/front/src/app/features/products/products.component.ts
// TODO: Implementar salvamento
console.log('Salvando produto:', this.editingProduct);
```
**Impacto**: Nenhum dado é persistido

### **3. UPLOAD DE IMAGENS NÃO INTEGRADO**
- Frontend: Upload em base64 (local)
- Backend: MinIO configurado mas não usado
- **Impacto**: Imagens não são salvas

### **4. INTERCEPTORS E GUARDS DESABILITADOS**
```typescript
// apps/api/src/app.module.ts
// {
//   provide: APP_INTERCEPTOR,
//   useClass: ResponseInterceptor,
// },
```
**Impacto**: Logs, métricas e tratamento de erros não funcionam

---

## 🎯 **PLANO DE INTEGRAÇÃO**

### **FASE 1: CORREÇÕES CRÍTICAS (1 dia)**
1. ✅ **Corrigir AuthContext** - Implementar decorator funcional
2. ✅ **Ativar Interceptors** - ResponseInterceptor, LoggingInterceptor
3. ✅ **Configurar MinIO** - Upload de imagens funcional
4. ✅ **Criar Seeders** - Dados iniciais para teste

### **FASE 2: INTEGRAÇÃO BÁSICA (2 dias)**
1. ✅ **AuthService** - Login/Register funcionais
2. ✅ **ProductService** - CRUD completo de produtos
3. ✅ **ImageService** - Upload integrado
4. ✅ **DashboardService** - Dados reais no dashboard

### **FASE 3: CRUD COMPLETO (3 dias)**
1. ✅ **CategoryService** - Categorias funcionais
2. ✅ **SupplierService** - Fornecedores funcionais
3. ✅ **CustomerService** - Clientes funcionais
4. ✅ **TransactionService** - Transações funcionais

### **FASE 4: FUNCIONALIDADES AVANÇADAS (2 dias)**
1. ✅ **ReportsService** - Relatórios com dados reais
2. ✅ **NotificationService** - Notificações funcionais
3. ✅ **PaymentService** - Pagamentos integrados
4. ✅ **Testes de Integração** - Validar todas as APIs

---

## 📊 **MÉTRICAS DE PROGRESSO**

| Módulo | Frontend Service | Backend API | Integração | Status |
|--------|------------------|-------------|------------|---------|
| Auth | ✅ | ✅ | ❌ | 50% |
| Products | ✅ | ✅ | ❌ | 50% |
| Categories | ✅ | ✅ | ❌ | 50% |
| Suppliers | ✅ | ✅ | ❌ | 50% |
| Customers | ✅ | ✅ | ❌ | 50% |
| Transactions | ✅ | ✅ | ❌ | 50% |
| Reports | ✅ | ✅ | ❌ | 50% |
| Images | ✅ | ✅ | ❌ | 30% |
| Dashboard | ❌ | ✅ | ❌ | 30% |
| Notifications | ✅ | ✅ | ❌ | 50% |
| Payments | ✅ | ✅ | ❌ | 50% |

**Progresso Geral**: 45% (Services criados, APIs prontas, integração pendente)

---

## 🔧 **PRÓXIMOS PASSOS**

1. **Corrigir AuthContext** - Prioridade máxima
2. **Implementar DashboardService** - Serviço faltando
3. **Integrar ProductService** - Primeiro CRUD completo
4. **Configurar MinIO** - Upload de imagens
5. **Criar seeders** - Dados para teste
6. **Testar integração** - Validar APIs

---

**📅 Última Atualização**: 20/10/2024  
**👤 Responsável**: Equipe de Desenvolvimento  
**🔄 Status**: Mapeamento completo - Próximo: Implementação
