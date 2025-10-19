# Dialog Service - Exemplos de Uso

## Como usar o Dialog Service

O Dialog Service foi criado para padronizar todas as ações de confirmação e exclusão no sistema. Aqui estão os exemplos de uso:

### 1. Confirmação de Exclusão (Mais Comum)

```typescript
import { DialogService } from '../../core/services/dialog.service';

constructor(private dialogService: DialogService) {}

deleteItem(item: any): void {
  this.dialogService.confirmDelete(item.name, 'item').subscribe(result => {
    if (result.confirmed) {
      // Executar exclusão
      this.performDelete(item);
    }
  });
}
```

### 2. Confirmação Personalizada

```typescript
confirmAction(): void {
  this.dialogService.confirm({
    title: 'Confirmar Ação',
    message: 'Tem certeza que deseja executar esta ação?',
    confirmText: 'Sim, executar',
    cancelText: 'Cancelar'
  }).subscribe(result => {
    if (result.confirmed) {
      // Executar ação
    }
  });
}
```

### 3. Dialog de Aviso

```typescript
showWarning(): void {
  this.dialogService.warning({
    title: 'Atenção',
    message: 'Esta ação pode afetar outros dados. Deseja continuar?',
    confirmText: 'Sim, continuar',
    cancelText: 'Cancelar'
  }).subscribe(result => {
    if (result.confirmed) {
      // Continuar com a ação
    }
  });
}
```

### 4. Dialog de Erro

```typescript
showError(): void {
  this.dialogService.error({
    title: 'Erro',
    message: 'Ocorreu um erro ao processar sua solicitação.'
  }).subscribe(result => {
    // Dialog de erro sempre retorna confirmed: true
    console.log('Usuário fechou o dialog de erro');
  });
}
```

### 5. Dialog de Informação

```typescript
showInfo(): void {
  this.dialogService.info({
    title: 'Informação',
    message: 'Operação realizada com sucesso!'
  }).subscribe(result => {
    // Dialog de info sempre retorna confirmed: true
    console.log('Usuário fechou o dialog de informação');
  });
}
```

## Tipos de Dialog Disponíveis

- **confirm**: Dialog de confirmação padrão (azul)
- **warning**: Dialog de aviso (amarelo/laranja)
- **error**: Dialog de erro (vermelho)
- **info**: Dialog de informação (azul)

## Configurações Disponíveis

```typescript
interface DialogConfig {
  title: string;           // Título do dialog
  message: string;         // Mensagem principal
  type?: 'confirm' | 'warning' | 'error' | 'info';  // Tipo do dialog
  confirmText?: string;    // Texto do botão de confirmação
  cancelText?: string;     // Texto do botão de cancelamento
  showCancel?: boolean;    // Mostrar botão de cancelamento
  icon?: string;           // Ícone personalizado
  data?: any;              // Dados adicionais
}
```

## Resultado do Dialog

```typescript
interface DialogResult {
  confirmed: boolean;      // true se confirmou, false se cancelou
  data?: any;              // Dados adicionais passados no config
}
```

## Integração com Componentes

Para usar o dialog service em qualquer componente:

1. Importe o DialogService
2. Injete no constructor
3. Use os métodos disponíveis
4. O componente `<app-dialog>` já está disponível globalmente no app.component.html

## Exemplo Completo

```typescript
import { Component } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="deleteUser(user)">Excluir Usuário</button>
    <button (click)="resetData()">Resetar Dados</button>
  `
})
export class ExampleComponent {
  constructor(private dialogService: DialogService) {}

  deleteUser(user: any): void {
    this.dialogService.confirmDelete(user.name, 'usuário').subscribe(result => {
      if (result.confirmed) {
        // Executar exclusão
        this.performUserDeletion(user);
      }
    });
  }

  resetData(): void {
    this.dialogService.warning({
      title: 'Resetar Dados',
      message: 'Todos os dados serão perdidos. Esta ação não pode ser desfeita.',
      confirmText: 'Sim, resetar',
      cancelText: 'Cancelar'
    }).subscribe(result => {
      if (result.confirmed) {
        // Executar reset
        this.performDataReset();
      }
    });
  }

  private performUserDeletion(user: any): void {
    // Lógica de exclusão
  }

  private performDataReset(): void {
    // Lógica de reset
  }
}
```
