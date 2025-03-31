import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '@core/models';
import { ButtonFollowComponent } from '../button-follow/button-follow.component';
import { FigurePropicPopoverComponent } from '../figure-propic-popover/figure-propic-popover.component';
import { StopClickPropagationDirective } from '@shared/directives';

@Component({
  selector: 'hm-molecule-user-byline',
  standalone: true,
  imports: [
    CommonModule,
    ButtonFollowComponent,
    RouterLink,
    FigurePropicPopoverComponent,
    StopClickPropagationDirective
  ],
  templateUrl: './molecule-user-byline.component.html'
})
export class MoleculeUserBylineComponent {
  @Input() user!: User;
}
