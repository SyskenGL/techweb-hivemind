import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToggleSwitchThemeComponent } from '../toggle-switch-theme/toggle-switch-theme.component';

@Component({
  selector: 'hm-header-brand',
  standalone: true,
  imports: [ToggleSwitchThemeComponent, RouterLink],
  templateUrl: './header-brand.component.html'
})
export class HeaderBrandComponent {}
