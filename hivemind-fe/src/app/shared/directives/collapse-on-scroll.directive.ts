import { ViewportScroller } from '@angular/common';
import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { fromEvent, map, Subject, takeUntil, throttleTime } from 'rxjs';

@Directive({
  selector: '[collapseOnScroll]',
  standalone: true
})
export class CollapseOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input() translate: number = -100;
  @Input() margin: number = 0;
  @Input() threshold: number = 0;
  @Input() throttle: number = 150;
  @Input() duration: number = 300;
  @Input() forward: boolean = true;

  private lastScrollY?: number;
  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly element: ElementRef,
    private readonly renderer: Renderer2,
    private readonly viewportScroller: ViewportScroller
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.applyBaseStyle();
    this.onScroll();
  }

  private applyBaseStyle(): void {
    this.renderer.setStyle(
      this.element.nativeElement,
      'transition',
      `transform ${this.duration}ms ease-in-out`
    );
  }

  private onScroll(): void {
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(this.throttle, undefined, {
          leading: false,
          trailing: true
        }),
        map(() => this.viewportScroller.getScrollPosition()[1])
      )
      .subscribe((scrollY) => {
        const shouldTranslate =
          this.lastScrollY &&
          ((this.forward && scrollY > this.lastScrollY) ||
            (!this.forward && scrollY < this.lastScrollY));
        if (Math.abs(scrollY - this.lastScrollY!) < this.threshold) {
          return;
        }
        this.renderer.setStyle(
          this.element.nativeElement,
          'transform',
          `translateY(${scrollY < this.margin || !shouldTranslate ? 0 : this.translate}%)`
        );
        this.lastScrollY = Math.max(scrollY, 0);
      });
  }
}
