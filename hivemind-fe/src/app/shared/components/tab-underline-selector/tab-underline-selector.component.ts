import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hm-tab-underline-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-underline-selector.component.html'
})
export class TabUnderlineSelectorComponent {
  @Input() tabs: { label: string; icon?: string }[] = [];
  @Input() activeTabIndex: number = 0;
  @Output() tabChanged: EventEmitter<number> = new EventEmitter<number>();

  selectTab(index: number): void {
    this.activeTabIndex = index;
    this.tabChanged.emit(index);
  }
}
