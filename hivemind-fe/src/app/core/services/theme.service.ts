import { DOCUMENT } from '@angular/common';
import {
  effect,
  Inject,
  Injectable,
  signal,
  WritableSignal
} from '@angular/core';
import { Theme } from '@core/enums';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  static readonly THEME_STORAGE_KEY: string = 'data-theme';

  private readonly theme: WritableSignal<Theme>;
  private readonly mediaQuery: MediaQueryList;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener(
      'change',
      this.onPreferredColorSchemeChanged.bind(this)
    );
    this.theme = signal(this.getInitialTheme());
    effect(this.applyTheme.bind(this));
  }

  private onPreferredColorSchemeChanged(event: MediaQueryListEvent): void {
    if (!localStorage.getItem(ThemeService.THEME_STORAGE_KEY)) {
      this.theme.set(event.matches ? Theme.DARK : Theme.LIGHT);
    }
  }

  private getInitialTheme(): Theme {
    const preferredColorScheme = this.mediaQuery.matches
      ? Theme.DARK
      : Theme.LIGHT;
    const storedTheme = localStorage.getItem(
      ThemeService.THEME_STORAGE_KEY
    ) as Theme;
    return storedTheme ?? preferredColorScheme;
  }

  private applyTheme(): void {
    const theme = this.theme();
    this.document.documentElement.setAttribute(
      ThemeService.THEME_STORAGE_KEY,
      theme
    );
    const favicon = this.document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement;
    favicon?.setAttribute('href', `favicons/${theme}.ico`);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(ThemeService.THEME_STORAGE_KEY, theme);
  }

  getTheme(): Theme {
    return this.theme();
  }
}
