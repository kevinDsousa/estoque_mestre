import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter } from 'rxjs';

// Core components
import { HeaderComponent } from './core/components/header/header.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { DialogComponent } from './core/components/dialog/dialog.component';

// Core services
import { ThemeService } from './core/services/theme.service';
import { SettingsService } from './core/services/settings.service';
import { LanguageService } from './core/services/language.service';
import { LayoutService } from './core/services/layout.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Estoque Mestre');
  
  isSidebarCollapsed = false;
  isSidebarOverlay = false;
  isLoginPage = false;

  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private settingsService: SettingsService,
    private languageService: LanguageService,
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeApp();
    this.subscribeToLayoutChanges();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeApp(): void {
    // Initialize theme
    this.themeService.getTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        // Theme is applied automatically by the service
        console.log('Theme initialized:', theme);
      });

    // Initialize language
    this.languageService.getCurrentLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(language => {
        // Language is applied automatically by the service
      });

    // Initialize settings
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        // Settings are applied automatically by the service
      });

    // Initialize layout
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.isSidebarCollapsed = config.sidebar.collapsed;
        this.isSidebarOverlay = config.sidebar.overlay;
      });
  }

  private subscribeToLayoutChanges(): void {
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.isSidebarCollapsed = config.sidebar.collapsed;
        this.isSidebarOverlay = config.sidebar.overlay;
      });
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url === '/login';
      });
  }
}
