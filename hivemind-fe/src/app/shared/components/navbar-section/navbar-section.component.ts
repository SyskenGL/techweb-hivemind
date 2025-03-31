import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hm-navbar-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-section.component.html'
})
export class NavbarSectionComponent {
  @Input() sections: string[] = [];
  @Input() currentSectionIndex?: number;
  @Output() scrollToSection: EventEmitter<number> = new EventEmitter();

  onSectionClick(sectionIndex: number): void {
    this.scrollToSection.emit(sectionIndex);
  }
}
