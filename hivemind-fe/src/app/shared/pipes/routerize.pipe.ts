import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface RouterizeConfig {
  className: string;
  route: string;
  substring?: number | [number, number];
}

@Pipe({
  name: 'routerize',
  standalone: true
})
export class RouterizePipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(html: string, configs: RouterizeConfig[]): SafeHtml {
    if (!html || !configs.length) return html;
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    configs.forEach(({ className, route, substring }) => {
      document.querySelectorAll(`.${className}`).forEach((anchor) => {
        let text = anchor.textContent?.trim() || '';
        if (substring !== undefined) {
          const [start, end = text.length] = Array.isArray(substring)
            ? substring
            : [substring, text.length];
          text = text.substring(start, end);
        }
        anchor.setAttribute('href', `${route}${text}`);
        anchor.setAttribute('router-link', `${route}${text}`);
      });
    });
    return this.sanitizer.bypassSecurityTrustHtml(document.body.innerHTML);
  }
}
