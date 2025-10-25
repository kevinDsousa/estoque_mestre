import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { FileUploadModule } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';

// Data Display
import { TableModule } from 'primeng/table';
import { DataViewModule } from 'primeng/dataview';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

// Panel
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TabsModule } from 'primeng/tabs';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitterModule } from 'primeng/splitter';

// Overlay
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { OverlayModule } from 'primeng/overlay';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

// Menu
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DockModule } from 'primeng/dock';
import { MegaMenuModule } from 'primeng/megamenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { StepsModule } from 'primeng/steps';
// TabMenu removed in PrimeNG v20
import { TieredMenuModule } from 'primeng/tieredmenu';

// Chart
import { ChartModule } from 'primeng/chart';

// Messages
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

// Media
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';

// Misc
import { BlockUIModule } from 'primeng/blockui';
import { FocusTrapModule } from 'primeng/focustrap';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

// Custom Components
import { EstoqueToastComponent } from '../components/estoque-toast/estoque-toast.component';
import { EstoqueLayoutComponent } from '../components/estoque-layout/estoque-layout.component';
import { EstoqueImageUploadComponent } from '../components/estoque-image-upload/estoque-image-upload.component';
import { EstoqueProductFormComponent } from '../components/estoque-product-form/estoque-product-form.component';
import { EstoqueDataTableComponent } from '../components/estoque-data-table/estoque-data-table.component';
import { EstoqueChartComponent } from '../components/estoque-chart/estoque-chart.component';
import { EstoqueConfirmDialogComponent } from '../components/estoque-confirm-dialog/estoque-confirm-dialog.component';
import { EstoqueLoadingComponent } from '../components/estoque-loading/estoque-loading.component';
import { EstoqueMetricCardComponent } from '../components/estoque-metric-card/estoque-metric-card.component';
import { EstoqueErrorMessageComponent } from '../components/estoque-error-message/estoque-error-message.component';
import { EstoqueSearchComponent } from '../components/estoque-search/estoque-search.component';
import { EstoqueFilterComponent } from '../components/estoque-filter/estoque-filter.component';

/**
 * Módulo principal do PrimeNG para Estoque Mestre
 * 
 * Este módulo importa todos os componentes do PrimeNG necessários
 * para o sistema Estoque Mestre, organizados por categoria.
 * 
 * @example
 * ```typescript
 * import { EstoqueMestrePrimeNGModule } from '@estoque-mestre/primeng-ui';
 * 
 * @NgModule({
 *   imports: [
 *     EstoqueMestrePrimeNGModule
 *   ]
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Form Controls
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    InputMaskModule,
    PasswordModule,
    SelectModule,
    MultiSelectModule,
    AutoCompleteModule,
    DatePickerModule,
    CheckboxModule,
    RadioButtonModule,
    ToggleButtonModule,
    SliderModule,
    RatingModule,
    FileUploadModule,
    EditorModule,
    
    // Data Display
    TableModule,
    DataViewModule,
    TreeModule,
    TreeTableModule,
    OrganizationChartModule,
    TagModule,
    BadgeModule,
    ChipModule,
    AvatarModule,
    AvatarGroupModule,
    SkeletonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    DividerModule,
    
    // Panel
    PanelModule,
    CardModule,
    AccordionModule,
    TabsModule,
    ScrollPanelModule,
    ToolbarModule,
    SplitterModule,
    
    // Overlay
    DialogModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    OverlayModule,
    TooltipModule,
    DrawerModule,
    DynamicDialogModule,
    
    // Menu
    MenuModule,
    MenubarModule,
    BreadcrumbModule,
    ContextMenuModule,
    DockModule,
    MegaMenuModule,
    PanelMenuModule,
    StepsModule,
    TieredMenuModule,
    
    // Chart
    ChartModule,
    
    // Messages
    MessageModule,
    ToastModule,
    
    // Media
    CarouselModule,
    GalleriaModule,
    ImageModule,
    
    // Misc
    BlockUIModule,
    FocusTrapModule,
    RippleModule,
    StyleClassModule,
    
    // PrimeFlex
  ],
  exports: [
    // Form Controls
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    InputMaskModule,
    PasswordModule,
    SelectModule,
    MultiSelectModule,
    AutoCompleteModule,
    DatePickerModule,
    CheckboxModule,
    RadioButtonModule,
    ToggleButtonModule,
    SliderModule,
    RatingModule,
    FileUploadModule,
    EditorModule,
    
    // Data Display
    TableModule,
    DataViewModule,
    TreeModule,
    TreeTableModule,
    OrganizationChartModule,
    TagModule,
    BadgeModule,
    ChipModule,
    AvatarModule,
    AvatarGroupModule,
    SkeletonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    DividerModule,
    
    // Panel
    PanelModule,
    CardModule,
    AccordionModule,
    TabsModule,
    ScrollPanelModule,
    ToolbarModule,
    SplitterModule,
    
    // Overlay
    DialogModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    OverlayModule,
    TooltipModule,
    DrawerModule,
    DynamicDialogModule,
    
    // Menu
    MenuModule,
    MenubarModule,
    BreadcrumbModule,
    ContextMenuModule,
    DockModule,
    MegaMenuModule,
    PanelMenuModule,
    StepsModule,
    TieredMenuModule,
    
    // Chart
    ChartModule,
    
    // Messages
    MessageModule,
    ToastModule,
    
    // Media
    CarouselModule,
    GalleriaModule,
    ImageModule,
    
    // Misc
    BlockUIModule,
    FocusTrapModule,
    RippleModule,
    StyleClassModule,
    
    // PrimeFlex
    
    // Custom Components
    EstoqueToastComponent,
    EstoqueLayoutComponent,
    EstoqueImageUploadComponent,
    EstoqueProductFormComponent,
    EstoqueDataTableComponent,
    EstoqueChartComponent,
    EstoqueConfirmDialogComponent,
    EstoqueLoadingComponent,
    EstoqueMetricCardComponent,
    EstoqueErrorMessageComponent,
    EstoqueSearchComponent,
    EstoqueFilterComponent,
  ],
  providers: [
    // ConfirmationService será fornecido pelo módulo que usar
  ]
})
export class EstoqueMestrePrimeNGModule {}
