# Componente de Ações

Componente reutilizável para padronizar o visual de botões de ação em todo o sistema.

## Uso Básico

```typescript
import { AcoesComponent, Acao } from '../../core/components/acoes/acoes.component';

@Component({
  imports: [AcoesComponent],
  template: `
    <app-acoes [acoes]="acoes"></app-acoes>
  `
})
export class MeuComponente {
  acoes: Acao[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      variant: 'secondary',
      action: () => this.editar()
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      variant: 'error',
      action: () => this.excluir()
    }
  ];
}
```

## Interface Acao

```typescript
interface Acao {
  label: string;           // Texto do botão
  icon: string;           // Ícone (Font Awesome/PrimeIcons)
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;     // Se o botão está desabilitado
  tooltip?: string;       // Tooltip personalizado
  action: () => void;     // Função a ser executada
}
```

## Propriedades do Componente

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `acoes` | `Acao[]` | `[]` | Array de ações a serem exibidas |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout das ações |
| `spacing` | `'tight' \| 'normal' \| 'loose'` | `'normal'` | Espaçamento entre botões |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Alinhamento das ações |
| `showLabels` | `boolean` | `true` | Se deve mostrar os labels dos botões |
| `maxVisible` | `number` | `0` | Máximo de ações visíveis (0 = todas) |

## Exemplos de Uso

### Ações Básicas
```html
<app-acoes [acoes]="acoesBasicas"></app-acoes>
```

### Ações com Limite
```html
<app-acoes 
  [acoes]="muitasAcoes" 
  [maxVisible]="3">
</app-acoes>
```

### Layout Vertical
```html
<app-acoes 
  [acoes]="acoes" 
  layout="vertical"
  align="left">
</app-acoes>
```

### Apenas Ícones
```html
<app-acoes 
  [acoes]="acoes" 
  [showLabels]="false">
</app-acoes>
```

### Ações com Diferentes Variantes
```typescript
acoes: Acao[] = [
  {
    label: 'Visualizar',
    icon: 'pi pi-eye',
    variant: 'primary',
    action: () => this.visualizar()
  },
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    variant: 'secondary',
    action: () => this.editar()
  },
  {
    label: 'Aprovar',
    icon: 'pi pi-check',
    variant: 'success',
    action: () => this.aprovar()
  },
  {
    label: 'Rejeitar',
    icon: 'pi pi-times',
    variant: 'error',
    action: () => this.rejeitar()
  },
  {
    label: 'Pendente',
    icon: 'pi pi-clock',
    variant: 'warning',
    action: () => this.pendente()
  }
];
```

## Responsividade

- **Desktop**: Mostra ícones e labels
- **Tablet**: Mostra apenas ícones, labels ocultos
- **Mobile**: Botões menores, apenas ícones

## Características

- ✅ **Padronização visual**: Todos os botões seguem o mesmo design
- ✅ **Flexibilidade**: Múltiplas variantes e tamanhos
- ✅ **Responsivo**: Adapta-se a diferentes telas
- ✅ **Acessibilidade**: Tooltips e estados disabled
- ✅ **Performance**: TrackBy otimizado
- ✅ **Dropdown**: Suporte a ações extras com menu
