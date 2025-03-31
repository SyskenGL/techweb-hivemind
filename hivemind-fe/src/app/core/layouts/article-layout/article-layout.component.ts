import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  FooterNavExtensiveComponent,
  HeaderBrandComponent
} from '@shared/components';

@Component({
  selector: 'hm-article-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderBrandComponent, FooterNavExtensiveComponent],
  templateUrl: './article-layout.component.html'
})
export class ArticleLayoutComponent {}
