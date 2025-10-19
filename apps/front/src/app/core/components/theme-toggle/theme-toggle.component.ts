import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  currentMode: ThemeMode = 'auto';
  isDarkMode = false;
  showOptions = false;
  availableModes = [
    { value: 'light' as ThemeMode, label: 'Claro' },
    { value: 'dark' as ThemeMode, label: 'Escuro' },
    { value: 'auto' as ThemeMode, label: 'Automático' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.getTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentMode = theme.mode;
      });

    this.themeService.getDarkModeState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
    this.showOptions = false;
  }

  getToggleTitle(): string {
    return `Alternar tema (atual: ${this.getModeLabel(this.currentMode)})`;
  }

  getToggleLabel(): string {
    return this.getModeLabel(this.currentMode);
  }

  getToggleIcon(): string {
    if (this.currentMode === 'auto') {
      return this.isDarkMode ? 'pi pi-moon' : 'pi pi-sun';
    }
    return this.currentMode === 'dark' ? 'pi pi-moon' : 'pi pi-sun';
  }

  getModeIcon(mode: ThemeMode): string {
    switch (mode) {
      case 'light':
        return 'pi pi-sun';
      case 'dark':
        return 'pi pi-moon';
      case 'auto':
        return 'pi pi-cog';
      default:
        return 'pi pi-sun';
    }
  }

  getModeLabel(mode: ThemeMode): string {
    const modeConfig = this.availableModes.find(m => m.value === mode);
    return modeConfig?.label || 'Claro';
  }
}
