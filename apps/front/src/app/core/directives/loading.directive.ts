import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';

@Directive({
  selector: '[appLoading]'
})
export class LoadingDirective implements OnInit, OnDestroy {
  @Input() appLoading: boolean = false;
  @Input() appLoadingText = 'Carregando...';

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Check if we should show loading based on API service
    if (this.appLoading) {
      this.apiService.loading$
        .pipe(takeUntil(this.destroy$))
        .subscribe(isLoading => {
          this.updateView(isLoading);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(isLoading: boolean): void {
    if (isLoading && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isLoading && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
