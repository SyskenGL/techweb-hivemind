import { CommonModule, Location } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CollapseOnScrollDirective } from '@shared/directives';

@Component({
  selector: 'hm-header-sticky-template',
  standalone: true,
  imports: [CommonModule, CollapseOnScrollDirective],
  templateUrl: './header-sticky-template.component.html'
})
export class HeaderStickyTemplateComponent {
  @Input() backPageButton: boolean = false;

  @ContentChild('contentNextToBackPageButton')
  templateContentNextToBackPageButton?: TemplateRef<any>;
  @ContentChild('contentMain') templateContentMain?: TemplateRef<any>;

  constructor(readonly location: Location) {}
}
