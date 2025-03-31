import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Author } from '@core/models';
import { TimeAgoPipe } from '@shared/pipes';
import { FigurePropicPopoverComponent } from '../figure-propic-popover/figure-propic-popover.component';
import { StopClickPropagationDirective } from '@shared/directives';

@Component({
  selector: 'hm-molecule-author-byline',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TimeAgoPipe,
    RouterLink,
    FigurePropicPopoverComponent,
    StopClickPropagationDirective
  ],
  animations: [],
  templateUrl: './molecule-author-byline.component.html'
})
export class MoleculeAuthorBylineComponent {
  @Input() author!: Author;
  @Input() createdAt!: string;
  @Input() updatedAt!: string | null;
}
