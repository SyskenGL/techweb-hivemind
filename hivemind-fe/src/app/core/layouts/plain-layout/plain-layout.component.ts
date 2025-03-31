import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterNavPlainComponent } from '@shared/components';

@Component({
  selector: 'hm-plain-layout',
  standalone: true,
  imports: [RouterOutlet, FooterNavPlainComponent],
  templateUrl: './plain-layout.component.html'
})
export class PlainLayoutComponent {}
