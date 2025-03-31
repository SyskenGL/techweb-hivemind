import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnDestroy,
  Inject,
  Renderer2
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  fromEvent,
  merge,
  Subject,
  takeUntil,
  tap,
  timer
} from 'rxjs';
import { StopClickPropagationDirective } from '@shared/directives';
import { FigurePropicComponent } from '../figure-propic/figure-propic.component';
import { CardProfilePreviewComponent } from '../card-profile-preview/card-profile-preview.component';

@Component({
  selector: 'hm-figure-propic-popover',
  standalone: true,
  imports: [
    CommonModule,
    FigurePropicComponent,
    CardProfilePreviewComponent,
    RouterLink,
    StopClickPropagationDirective
  ],
  templateUrl: './figure-propic-popover.component.html'
})
export class FigurePropicPopoverComponent implements AfterViewInit, OnDestroy {
  @Input() username!: string;
  @Input() propicId?: string | null = null;
  @Input() fadeDuration: number = 300;

  @ViewChild('popover', { read: ElementRef })
  popoverElement!: ElementRef<HTMLDivElement>;
  @ViewChild('propic', { read: ElementRef })
  propicElement!: ElementRef<HTMLDivElement>;

  hasBeenOpened: boolean = false;
  isProfilePreviewLoaded: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();
  private touchOutsideListener: () => void = () => {};
  private popoverShouldBeVisibile = new BehaviorSubject<boolean>(false);
  private keepPopoverVisible = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  get popoverVisible(): boolean {
    return this.popoverElement.nativeElement.matches(':popover-open');
  }

  ngAfterViewInit(): void {
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupEventListeners() {
    merge(
      fromEvent(this.propicElement.nativeElement, 'mouseenter').pipe(
        tap(() => this.popoverShouldBeVisibile.next(true))
      ),
      fromEvent(this.propicElement.nativeElement, 'mouseleave').pipe(
        tap(() => this.popoverShouldBeVisibile.next(false))
      ),
      fromEvent(this.propicElement.nativeElement, 'touchstart').pipe(
        tap(() => this.popoverShouldBeVisibile.next(true))
      ),
      fromEvent(this.popoverElement.nativeElement, 'mouseenter').pipe(
        tap(() => this.keepPopoverVisible.next(true))
      ),
      fromEvent(this.popoverElement.nativeElement, 'mouseleave').pipe(
        tap(() => this.keepPopoverVisible.next(false))
      )
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    combineLatest([this.popoverShouldBeVisibile, this.keepPopoverVisible])
      .pipe(
        debounceTime(100),
        tap(([popoverShouldBeVisibile, keepPopoverVisible]) => {
          this.updatePopoverVisibility(
            popoverShouldBeVisibile || keepPopoverVisible
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private updatePopoverVisibility(visible: boolean) {
    if (this.popoverVisible !== visible) {
      visible ? this.showPopover() : this.hidePopover();
    }
  }

  private showPopover() {
    this.hasBeenOpened = true;
    const propicRect = this.propicElement.nativeElement.getBoundingClientRect();
    const popover = this.popoverElement.nativeElement;
    this.renderer.setStyle(popover, 'visibility', 'hidden');
    this.renderer.setStyle(popover, 'display', 'block');
    this.renderer.setStyle(popover, 'position', 'fixed');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const document = this.document.documentElement;
        const popoverHeight = popover.offsetHeight;
        const popoverWidth = popover.offsetWidth;
        this.renderer.setStyle(popover, 'visibility', '');
        this.renderer.setStyle(popover, 'display', '');
        this.renderer.setStyle(popover, 'position', 'sticky');
        this.renderer.setStyle(popover, 'opacity', '0');
        this.renderer.setStyle(
          popover,
          'transition',
          `opacity ${this.fadeDuration}ms ease-in-out`
        );
        this.renderer.setStyle(popover, 'inset', 'unset');
        this.renderer.setStyle(popover, 'background', 'transparent');
        const spaceBelow = document.clientHeight - propicRect.bottom;
        const spaceAbove = propicRect.top;
        const shouldPlaceAbove =
          popoverHeight > spaceBelow && spaceAbove > spaceBelow;
        this.renderer.setStyle(
          popover,
          shouldPlaceAbove ? 'bottom' : 'top',
          shouldPlaceAbove
            ? `${document.clientHeight - propicRect.top - document.scrollTop}px`
            : `${propicRect.bottom + document.scrollTop}px`
        );
        let popoverLeft =
          propicRect.left - popoverWidth / 2 + propicRect.width / 2;
        popoverLeft = popoverLeft < 0 ? propicRect.left - 4 : popoverLeft;
        this.renderer.setStyle(popover, 'left', `${popoverLeft}px`);
        popover.showPopover();
        this.renderer.setStyle(popover, 'opacity', '1');
        this.touchOutsideListener = this.renderer.listen(
          this.document,
          'touchstart',
          this.onTouchOutside
        );
      })
    );
  }

  private hidePopover() {
    const popover = this.popoverElement.nativeElement;
    this.renderer.setStyle(popover, 'opacity', '0');
    timer(this.fadeDuration).subscribe(() => {
      popover.hidePopover();
      this.touchOutsideListener();
      this.hasBeenOpened = this.isProfilePreviewLoaded;
    });
  }

  private onTouchOutside = (event: TouchEvent) => {
    const target = event.target as Node | null;
    if (
      target &&
      !this.popoverElement.nativeElement.contains(target) &&
      !this.propicElement.nativeElement.contains(target)
    ) {
      this.popoverShouldBeVisibile.next(false);
      this.keepPopoverVisible.next(false);
    }
  };
}
