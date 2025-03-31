import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[interceptRouterLinks]',
  standalone: true
})
export class InterceptRouterLinksDirective {
  @Input() stopPropagation?: boolean = false;

  constructor(private readonly router: Router) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    const element = target.closest('[router-link]');
    const url = element?.getAttribute('router-link');
    if (element && url) {
      event.preventDefault();
      this.stopPropagation && event.stopPropagation();
      this.router.navigateByUrl(url);
    }
  }
}
