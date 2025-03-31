import { Component } from '@angular/core';
import {
  CarouselHeroTitleComponent,
  FigureGlitchedLogoComponent
} from '@shared/components';
import { FormSignInComponent } from '@features/auth/components';

@Component({
  selector: 'hm-sign-in',
  standalone: true,
  imports: [
    FormSignInComponent,
    CarouselHeroTitleComponent,
    FigureGlitchedLogoComponent
  ],
  templateUrl: './sign-in.component.html'
})
export class SignInComponent {}
