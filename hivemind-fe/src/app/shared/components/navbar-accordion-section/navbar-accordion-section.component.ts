import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { NavbarSectionComponent } from '../navbar-section/navbar-section.component';

@Component({
  selector: 'hm-navbar-accordion-section',
  standalone: true,
  imports: [NavbarSectionComponent],
  templateUrl: './navbar-accordion-section.component.html'
})
export class NavbarAccordionSectionComponent {
  @Input() sections: string[] = [];
  @Input() currentSectionIndex?: number;
  @Output() scrollToSection: EventEmitter<number> = new EventEmitter();

  @ViewChild('checkbox') checkbox!: ElementRef<HTMLInputElement>;

  get title(): string {
    return this.currentSectionIndex !== undefined
      ? `${this.currentSectionIndex + 1}.&ensp;${this.sections.at(this.currentSectionIndex)}`
      : '';
  }

  onSectionClick(sectionIndex: number): void {
    this.checkbox.nativeElement.click();
    setTimeout(() => this.scrollToSection.emit(sectionIndex), 200);
  }
}
