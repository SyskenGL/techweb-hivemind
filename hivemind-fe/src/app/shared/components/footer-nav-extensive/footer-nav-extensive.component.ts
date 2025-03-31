import { Component } from '@angular/core';

@Component({
  selector: 'hm-footer-nav-extensive',
  standalone: true,
  imports: [],
  templateUrl: './footer-nav-extensive.component.html'
})
export class FooterNavExtensiveComponent {
  currentYear: number = new Date().getFullYear();
}
