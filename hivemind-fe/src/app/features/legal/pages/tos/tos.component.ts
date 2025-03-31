import { ViewportScroller } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  NavbarSectionComponent,
  NavbarAccordionSectionComponent
} from '@shared/components';

@Component({
  selector: 'hm-tos',
  standalone: true,
  imports: [NavbarSectionComponent, NavbarAccordionSectionComponent],
  templateUrl: './tos.component.html'
})
export class TosComponent {
  @ViewChildren('localeA') sectionsLocaleA!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('localeB') sectionsLocaleB!: QueryList<ElementRef<HTMLElement>>;

  currentSectionIndices: { [locale: string]: number };
  scrollOffset!: number;

  constructor(
    private readonly viewportScroller: ViewportScroller,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    this.currentSectionIndices = { localeA: 0, localeB: 0 };
    this.setOffsetBasedOnBreakpoint();
  }

  @HostListener('window:scrollend', [])
  onScrollEnd(): void {
    this.updateSectionIndices();
  }

  onScrollToSection(sectionIndex: number, locale: string): void {
    const sections =
      locale === 'localeA' ? this.sectionsLocaleA : this.sectionsLocaleB;
    this.scrollToSection(sections.get(sectionIndex)!);
  }

  private setOffsetBasedOnBreakpoint(): void {
    this.breakpointObserver
      .observe(['(min-width: 768px)'])
      .subscribe((result) => {
        this.scrollOffset = result.matches ? 112 : 180;
      });
  }

  private scrollToSection(section: ElementRef<HTMLElement>): void {
    const sectionRect = section.nativeElement.getBoundingClientRect();
    const yOffset =
      sectionRect.top -
      this.scrollOffset +
      this.viewportScroller.getScrollPosition()[1];
    window.scrollTo({ top: yOffset, behavior: 'smooth' });
  }

  private getSectionIndexInView(
    sections: QueryList<ElementRef<HTMLElement>>,
    currentSectionIndex: number
  ): number {
    const index = sections.toArray().findIndex((section) => {
      const sectionRect = section.nativeElement.getBoundingClientRect();
      return sectionRect.bottom - this.scrollOffset > 0;
    });
    return index === -1 ? currentSectionIndex : index;
  }

  private updateSectionIndices(): void {
    this.currentSectionIndices['localeA'] = this.getSectionIndexInView(
      this.sectionsLocaleA,
      this.currentSectionIndices['localeA']
    );
    this.currentSectionIndices['localeB'] = this.getSectionIndexInView(
      this.sectionsLocaleB,
      this.currentSectionIndices['localeB']
    );
  }
}
