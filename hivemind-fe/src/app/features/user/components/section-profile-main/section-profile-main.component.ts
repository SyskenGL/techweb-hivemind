import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { filter, take } from 'rxjs';
import { User } from '@core/models';
import {
  ButtonFollowComponent,
  FigureCoverComponent,
  FigurePropicComponent
} from '@shared/components';
import { ShortNumberPipe } from '@shared/pipes';

@Component({
  selector: 'hm-section-profile-main',
  standalone: true,
  imports: [
    CommonModule,
    ButtonFollowComponent,
    FigureCoverComponent,
    FigurePropicComponent,
    ShortNumberPipe
  ],
  templateUrl: './section-profile-main.component.html'
})
export class SectionProfileMainComponent implements AfterViewInit {
  @Input() user?: User | null;
  @Output() badgeContainerIntersected: EventEmitter<boolean> =
    new EventEmitter();
  @Output() followersClicked: EventEmitter<void> = new EventEmitter();
  @Output() followingsClicked: EventEmitter<void> = new EventEmitter();
  @Output() editProfileClicked: EventEmitter<void> = new EventEmitter();

  @ViewChildren('badgeContainer', { read: ElementRef })
  badgeContainer!: QueryList<ElementRef<HTMLElement>>;

  constructor(private readonly route: ActivatedRoute) {}

  get username(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngAfterViewInit(): void {
    this.observeBadgeContainer();
  }

  private observeBadgeContainer(): void {
    const createObserver = (element: HTMLElement) => {
      const observer = new IntersectionObserver(
        ([entry]) => this.badgeContainerIntersected.emit(!entry.isIntersecting),
        { rootMargin: '-50px' }
      );
      observer.observe(element);
    };
    if (this.badgeContainer.first) {
      createObserver(this.badgeContainer.first.nativeElement);
    } else {
      this.badgeContainer.changes
        .pipe(
          filter((queryList: QueryList<any>) => queryList.length > 0),
          take(1)
        )
        .subscribe((queryList) =>
          createObserver(queryList.first.nativeElement)
        );
    }
  }
}
