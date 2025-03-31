import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Signal,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChildren,
  WritableSignal
} from '@angular/core';
import {
  AngularVirtualizer,
  injectVirtualizer,
  VirtualItem
} from '@tanstack/angular-virtual';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { debounceTime, fromEvent, tap } from 'rxjs';

@Component({
  selector: 'hm-infinite-scroll-container',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './infinite-scroll-container.component.html'
})
export class InfiniteScrollContainerComponent<T = any> implements OnChanges {
  @Input() scrollContainer!: HTMLDivElement;
  @Input() items: T[] = [];
  @Input() overscan?: number;
  @Input() estimatedSize: number = 0;
  @Input() infiniteScrollDisabled: boolean = false;
  @Input() infiniteScrollBuffer: number = 5;
  @Input() infiniteScrollThrottle: number = 150;
  @Input() showLoading: boolean = false;
  @Input() showError: boolean = false;
  @Output() loadMore: EventEmitter<void> = new EventEmitter();

  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ContentChild('loadingTemplate') loadingTemplate!: TemplateRef<any>;
  @ContentChild('errorTemplate') errorTemplate!: TemplateRef<any>;

  virtualItems: Signal<readonly ElementRef<HTMLDivElement>[]> =
    viewChildren<ElementRef<HTMLDivElement>>('virtualItem');

  virtualizer!: AngularVirtualizer<any, any>;

  private readonly itemsCount: WritableSignal<number> = signal(0);

  constructor() {
    this.initializeVirtualizer();
    this.setupMeasurement();
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

  refreshMeasurement() {
    this.virtualizer.measure();
  }

  private initializeVirtualizer(): void {
    this.virtualizer = injectVirtualizer(() => ({
      scrollElement: this.scrollContainer,
      count: this.itemsCount(),
      estimateSize: () => this.estimatedSize,
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

  private shouldLoadMore(): boolean {
    return (
      !this.infiniteScrollDisabled &&
      this.scrollContainer!.scrollHeight === this.scrollContainer!.clientHeight
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
