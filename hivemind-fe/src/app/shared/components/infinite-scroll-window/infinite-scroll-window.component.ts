import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  signal,
  afterNextRender,
  effect,
  viewChildren,
  viewChild,
  WritableSignal,
  Signal,
  SimpleChanges,
  ContentChild,
  TemplateRef,
  OnChanges
} from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import {
  AngularVirtualizer,
  injectWindowVirtualizer,
  VirtualItem
} from '@tanstack/angular-virtual';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { debounceTime, fromEvent, tap } from 'rxjs';

@Component({
  selector: 'hm-infinite-scroll-window',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './infinite-scroll-window.component.html'
})
export class InfiniteScrollWindowComponent<T = any> implements OnChanges {
  @Input() items: T[] = [];
  @Input() estimatedSize: number = 0;
  @Input() overscan?: number;
  @Input() infiniteScrollDisabled: boolean = false;
  @Input() infiniteScrollBuffer: number = 5;
  @Input() infiniteScrollThrottle: number = 150;
  @Input() showLoading: boolean = false;
  @Input() showError: boolean = false;
  @Output() loadMore: EventEmitter<void> = new EventEmitter();

  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ContentChild('loadingTemplate') loadingTemplate!: TemplateRef<any>;
  @ContentChild('errorTemplate') errorTemplate!: TemplateRef<any>;

  scrollContainer: Signal<ElementRef<HTMLDivElement> | undefined> =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  virtualItems: Signal<readonly ElementRef<HTMLDivElement>[]> =
    viewChildren<ElementRef<HTMLDivElement>>('virtualItem');

  virtualizer!: AngularVirtualizer<any, any>;
  parentOffset: WritableSignal<number> = signal(0);

  private readonly itemsCount: WritableSignal<number> = signal(0);

  constructor(private readonly viewportScroller: ViewportScroller) {
    this.initializeVirtualizer();
    this.setupMeasurement();
    this.setupParentOffset();
    this.triggerLoadMoreOnWindowResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['showLoading'] || changes['showError']) {
      const extraItems = (this.showLoading ? 1 : 0) + (this.showError ? 1 : 0);
      this.itemsCount.set(this.items.length + extraItems);
    }
    if (changes['items']?.previousValue || changes['infiniteScrollDisabled']) {
      setTimeout(
        () => this.shouldLoadMore() && this.loadMore.emit(),
        this.infiniteScrollThrottle
      );
    }
  }

  trackByVirtualItem(_: number, item: VirtualItem): number {
    return item.index;
  }

  getIndexFromScrollPosition(): number | undefined {
    return this.virtualizer.getVirtualItemForOffset(
      this.viewportScroller.getScrollPosition()[1]
    )?.index;
  }

  scrollToIndex(index: number): void {
    requestAnimationFrame(() =>
      this.virtualizer.scrollToIndex(index, { align: 'start' })
    );
  }

  private initializeVirtualizer(): void {
    this.virtualizer = injectWindowVirtualizer(() => ({
      estimateSize: () => this.estimatedSize,
      count: this.itemsCount(),
      scrollMargin: this.parentOffset(),
      useAnimationFrameWithResizeObserver: true,
      overscan: this.overscan
    }));
  }

  private setupMeasurement(): void {
    const measurementEffect = () => {
      this.virtualItems().forEach((el) => {
        this.virtualizer.measureElement(el.nativeElement);
      });
    };
    effect(measurementEffect, { allowSignalWrites: true });
  }

  private setupParentOffset(): void {
    afterNextRender(() => {
      this.parentOffset.set(
        this.scrollContainer()?.nativeElement.offsetTop ?? 0
      );
    });
  }

  private shouldLoadMore(): boolean {
    const element = this.scrollContainer()!.nativeElement;
    return (
      !this.infiniteScrollDisabled &&
      element.getBoundingClientRect().bottom < window.innerHeight
    );
  }

  private triggerLoadMoreOnWindowResize(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(this.infiniteScrollThrottle),
        tap(() => this.shouldLoadMore() && this.loadMore.emit())
      )
      .subscribe();
  }
}
