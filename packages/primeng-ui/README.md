# @estoque-mestre/primeng-ui

Biblioteca de componentes UI baseada no PrimeNG para o sistema Estoque Mestre.

## 🎨 Características

- **Tema Customizado**: Tons azul escuro com cores de contraste
- **Componentes Standalone**: Compatível com Angular 18+
- **Arquitetura Modular**: Organizado por funcionalidades
- **TypeScript**: Totalmente tipado
- **SCSS**: Variáveis CSS globais e tema customizado
- **Responsivo**: Design adaptável para todos os dispositivos

## 📦 Instalação

```bash
# Instalar dependências
pnpm add primeng primeicons primeflex

# Instalar o pacote
pnpm add @estoque-mestre/primeng-ui
```

## 🚀 Uso

### Importar o Módulo Principal

```typescript
import { EstoqueMestrePrimeNGModule } from '@estoque-mestre/primeng-ui';

@NgModule({
  imports: [
    EstoqueMestrePrimeNGModule
  ]
})
export class AppModule { }
```

### Usar Componentes Standalone

```typescript
import { EstoqueButtonComponent, EstoqueInputComponent } from '@estoque-mestre/primeng-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [EstoqueButtonComponent, EstoqueInputComponent],
  template: `
    <estoque-input 
      type="text"
      label="Nome do Produto"
      placeholder="Digite o nome do produto"
      [(ngModel)]="productName">
    </estoque-input>
    
    <estoque-button 
      variant="primary" 
      size="large" 
      icon="pi pi-plus"
      (click)="saveProduct()">
      Salvar Produto
    </estoque-button>
  `
})
export class ExampleComponent {
  productName = '';
  
  saveProduct() {
    console.log('Salvando produto:', this.productName);
  }
}
```

### Importar Estilos

```scss
// No seu arquivo de estilos principal
@import '@estoque-mestre/primeng-ui/themes/estoque-mestre.scss';
```

## 🎨 Tema e Cores

### Paleta de Cores

- **Primary**: Tons de azul (#0066cc)
- **Secondary**: Tons de laranja (#ff8c00)
- **Success**: Verde (#22c55e)
- **Warning**: Amarelo (#f59e0b)
- **Error**: Vermelho (#ef4444)
- **Info**: Azul claro (#3b82f6)

### Variáveis CSS

```scss
// Usar variáveis CSS globais
.my-component {
  background-color: var(--p-primary-color);
  color: var(--p-primary-color-text);
  border-radius: var(--p-border-radius);
  padding: var(--p-spacing-4);
}
```

## 📚 Componentes Disponíveis

### EstoqueButton

Botão customizado com variantes e tamanhos.

```html
<estoque-button 
  variant="primary" 
  size="large" 
  icon="pi pi-plus"
  [loading]="isLoading"
  (click)="onClick()">
  Adicionar Produto
</estoque-button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outlined' | 'text'
- `size`: 'small' | 'normal' | 'large'
- `icon`: string (classe do PrimeIcons)
- `loading`: boolean
- `disabled`: boolean

### EstoqueInput

Input customizado com suporte a diferentes tipos.

```html
<estoque-input 
  type="text"
  label="Nome do Produto"
  placeholder="Digite o nome do produto"
  [required]="true"
  [floatLabel]="true"
  [(ngModel)]="productName">
</estoque-input>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'mask'
- `label`: string
- `placeholder`: string
- `required`: boolean
- `floatLabel`: boolean
- `errorMessage`: string
- `helpText`: string

## 🏗️ Arquitetura

```
packages/primeng-ui/
├── src/
│   ├── components/
│   │   ├── primeng.module.ts          # Módulo principal
│   │   ├── estoque-button/            # Componente de botão
│   │   ├── estoque-input/             # Componente de input
│   │   └── ...                        # Outros componentes
│   ├── styles/
│   │   └── variables.scss             # Variáveis CSS globais
│   ├── themes/
│   │   └── estoque-mestre.scss        # Tema customizado
│   └── index.ts                       # Exports principais
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Desenvolvimento

### Build

```bash
pnpm run build
```

### Watch Mode

```bash
pnpm run dev
```

### Type Check

```bash
pnpm run check-types
```

## 📋 Dependências

### Peer Dependencies

- `@angular/common`: ^18.0.0
- `@angular/core`: ^18.0.0
- `@angular/forms`: ^18.0.0
- `@angular/router`: ^18.0.0
- `primeng`: ^18.0.0
- `primeicons`: ^7.0.0
- `primeflex`: ^3.3.1

### Dependencies

- `@estoque-mestre/models`: workspace:*

## 🎯 Roadmap

- [ ] Mais componentes customizados
- [ ] Suporte a dark mode
- [ ] Temas adicionais
- [ ] Documentação interativa
- [ ] Storybook integration
- [ ] Testes unitários

## 📄 Licença

MIT
