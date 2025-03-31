import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[stopClickPropagation]',
  standalone: true
})
export class StopClickPropagationDirective {
  @HostListener('click', ['$event'])
  handleClick(event: Event): void {
    event.stopPropagation();
  }
}
