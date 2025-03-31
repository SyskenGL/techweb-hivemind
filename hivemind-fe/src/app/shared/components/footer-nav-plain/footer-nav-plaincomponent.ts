import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'hm-footer-nav-plain',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-nav-plain.component.html'
})
export class FooterNavPlainComponent {
  @Input() complete: boolean = true;

  currentYear: number = new Date().getFullYear();
}
