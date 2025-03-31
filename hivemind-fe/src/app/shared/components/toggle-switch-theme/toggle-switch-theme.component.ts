import { Component } from '@angular/core';
import { Theme } from '@core/enums';
import { ThemeService } from '@core/services';

@Component({
  selector: 'hm-toggle-switch-theme',
  standalone: true,
  imports: [],
  templateUrl: './toggle-switch-theme.component.html'
})
export class ToggleSwitchThemeComponent {
  constructor(private readonly themeService: ThemeService) {}

  isDarkTheme(): boolean {
    return this.themeService.getTheme() === Theme.DARK;
  }

  toggleTheme(): void {
    const theme = this.isDarkTheme() ? Theme.LIGHT : Theme.DARK;
    this.themeService.setTheme(theme);
  }
}
