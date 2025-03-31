import { Component } from '@angular/core';
import {
  CarouselHeroTitleComponent,
  FigureGlitchedLogoComponent
} from '@shared/components';
import { FormSignUpComponent } from '@features/auth/components';

@Component({
  selector: 'hm-sign-up',
  standalone: true,
  imports: [
    FormSignUpComponent,
    CarouselHeroTitleComponent,
    FigureGlitchedLogoComponent
  ],
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent {}
