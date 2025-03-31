import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'hm-button-retry',
  standalone: true,
  imports: [],
  templateUrl: './button-retry.component.html'
})
export class ButtonRetryComponent {
  @Output() retry: EventEmitter<void> = new EventEmitter();
}
