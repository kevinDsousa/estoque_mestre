# Sistema de Autenticação e Autorização

Sistema completo de autenticação e autorização para o Estoque Mestre, incluindo contexto de usuário, guards de role e decorators.

## Funcionalidades

### ✅ Implementadas

- **AuthContextInterceptor**: Captura automaticamente o contexto de autenticação
- **AuthContext Decorator**: Extrai informações do usuário autenticado
- **AuthContextService**: Serviço para gerenciar contexto de autenticação
- **RoleGuard**: Guard para verificar permissões baseadas em roles
- **Roles Decorator**: Decorator para definir roles necessários

## Componentes

### 1. AuthContextInterceptor

Intercepta requisições e adiciona o contexto de autenticação ao request.

```typescript
// Adiciona automaticamente ao request:
request.authContext = {
  userId: user.userId || user.id,
  companyId: user.companyId,
  role: user.role,
  email: user.email,
};
```

### 2. AuthContext Decorator

Extrai informações do contexto de autenticação.

```typescript
// Uso básico
@Get('profile')
async getProfile(@AuthContext() authContext: AuthContext) {
  console.log('User:', authContext.userId);
  console.log('Company:', authContext.companyId);
  console.log('Role:', authContext.role);
}

// Extrair campo específico
@Get('profile')
async getProfile(@AuthContext('userId') userId: string) {
  console.log('User ID:', userId);
}
```

### 3. AuthContextService

Serviço para acessar o contexto de autenticação em qualquer lugar.

```typescript
@Injectable()
export class MyService {
  constructor(private authContextService: AuthContextService) {}

  async doSomething() {
    const userId = this.authContextService.getUserId();
    const companyId = this.authContextService.getCompanyId();
    const isAdmin = this.authContextService.isAdmin();
    
    if (this.authContextService.hasRole('ADMIN')) {
      // Admin logic
    }
  }
}
```

### 4. RoleGuard

Guard para verificar permissões baseadas em roles.

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  async getUsers() {
    // Only admins can access
  }

  @Get('reports')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getReports() {
    // Admins and managers can access
  }
}
```

## Configuração

### 1. Aplicar o Interceptor Globalmente

```typescript
// app.module.ts
import { AuthContextInterceptor } from './common/interceptors/auth-context.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthContextInterceptor,
    },
  ],
})
export class AppModule {}
```

### 2. Usar em Controllers

```typescript
@Controller('example')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ExampleController {
  @Get('public')
  async publicEndpoint() {
    // Accessible to all authenticated users
  }

  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  async adminOnly(@AuthContext() authContext: AuthContext) {
    // Only admins can access
    return { message: `Hello admin ${authContext.email}` };
  }

  @Get('manager-or-admin')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async managerOrAdmin() {
    // Admins and managers can access
  }
}
```

### 3. Usar em Services

```typescript
@Injectable()
export class ExampleService {
  constructor(private authContextService: AuthContextService) {}

  async createSomething(data: any) {
    const userId = this.authContextService.getUserId();
    const companyId = this.authContextService.getCompanyId();

    return this.prisma.something.create({
      data: {
        ...data,
        userId,
        companyId,
      },
    });
  }
}
```

## Roles Disponíveis

- **ADMIN**: Acesso total ao sistema
- **MANAGER**: Gerenciamento de operações
- **EMPLOYEE**: Operações básicas

## Exemplos de Uso

### Controller com Roles

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProductController {
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() data: CreateProductDto, @AuthContext() auth: AuthContext) {
    return this.productService.create(data, auth.companyId, auth.userId);
  }

  @Get()
  async findAll(@AuthContext('companyId') companyId: string) {
    return this.productService.findAll(companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @AuthContext() auth: AuthContext) {
    return this.productService.remove(id, auth.companyId, auth.userId);
  }
}
```

### Service com Contexto

```typescript
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private authContextService: AuthContextService,
  ) {}

  async create(data: CreateProductDto) {
    const userId = this.authContextService.getUserId();
    const companyId = this.authContextService.getCompanyId();

    if (!userId || !companyId) {
      throw new UnauthorizedException('User context not available');
    }

    return this.prisma.product.create({
      data: {
        ...data,
        companyId,
        createdBy: userId,
      },
    });
  }
}
```

## Benefícios

1. **Automático**: Contexto capturado automaticamente em todas as requisições
2. **Type-Safe**: Tipagem completa para o contexto de autenticação
3. **Flexível**: Múltiplas formas de acessar informações do usuário
4. **Seguro**: Guards de role para controle de acesso granular
5. **Reutilizável**: Decorators e serviços podem ser usados em qualquer lugar

## Status

✅ **COMPLETO** - Sistema de autenticação e autorização totalmente implementado

