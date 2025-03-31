import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Buzz } from '@core/models';
import { CardBuzzComponent } from '../card-buzz/card-buzz.component';
import { Router } from '@angular/router';
import { BuzzService } from '@core/services';

@Component({
  selector: 'hm-anchor-buzz',
  standalone: true,
  imports: [CardBuzzComponent],
  templateUrl: './anchor-buzz.component.html'
})
export class AnchorBuzzComponent {
  @Input() buzz!: Buzz;
  @Output() buzzDeleted: EventEmitter<void> = new EventEmitter();

  constructor(
    private readonly router: Router,
    private readonly buzzService: BuzzService
  ) {}

  onClick(): void {
    this.buzzService.view(this.buzz).subscribe();
    this.router.navigateByUrl('/buzzes/' + this.buzz.id);
  }
}
