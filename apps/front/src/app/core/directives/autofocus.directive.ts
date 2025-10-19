import { Directive, ElementRef, Input, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements OnInit, AfterViewInit {
  @Input() appAutofocus: boolean = true;
  @Input() appAutofocusDelay = 0;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutofocus) {
      this.focusElement();
    }
  }

  ngAfterViewInit(): void {
    if (this.appAutofocus && this.appAutofocusDelay > 0) {
      setTimeout(() => {
        this.focusElement();
      }, this.appAutofocusDelay);
    }
  }

  private focusElement(): void {
    const element = this.elementRef.nativeElement;
    
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}
