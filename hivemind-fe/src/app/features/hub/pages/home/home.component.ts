import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { BuzzCriterion } from '@core/enums';
import { Buzz } from '@core/models';
import { Reusable } from '@core/interfaces';
import { BuzzService } from '@core/services';
import {
  HeaderStickyTemplateComponent,
  TabUnderlineSelectorComponent,
  InfiniteScrollWindowComponent,
  ButtonRetryComponent,
  AnchorBuzzComponent
} from '@shared/components';

interface Feed {
  buzzes: Buzz[];
  criterion: BuzzCriterion;
  cursor?: string | null;
  lastIndex?: number;
  fetching: boolean;
  fetchFailed: boolean;
}

@Component({
  selector: 'hm-home',
  standalone: true,
  imports: [
    CommonModule,
    TabUnderlineSelectorComponent,
    HeaderStickyTemplateComponent,
    InfiniteScrollWindowComponent,
    ButtonRetryComponent,
    AnchorBuzzComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, Reusable {
  static readonly FEED_STORAGE_KEY = 'hm-feed';

  @ViewChild('header') header!: TemplateRef<any>;
  @ViewChild(InfiniteScrollWindowComponent)
  infiniteScrollWindowComponent!: InfiniteScrollWindowComponent;

  feeds: Feed[] = [];
  activeTabIndex: number = 0;
  infiniteScrollDisabled: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();

  readonly tabs: { label: string; icon: string; criterion: BuzzCriterion }[] = [
    {
      label: 'Mainstream',
      icon: 'fa-solid fa-fire-flame-curved',
      criterion: BuzzCriterion.MAINSTREAM
    },
    {
      label: 'Unpopular',
      icon: 'fa-solid fa-arrow-down-short-wide',
      criterion: BuzzCriterion.UNPOPULAR
    },
    {
      label: 'Controverse',
      icon: 'fa-solid fa-arrow-down-up-across-line',
      criterion: BuzzCriterion.CONTROVERSE
    },
    {
      label: 'Followings',
      icon: 'fa-solid fa-users',
      criterion: BuzzCriterion.FOLLOWINGS
    }
  ];

  constructor(
    private readonly buzzService: BuzzService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeFeeds();
    this.subscribeToBuzzChanges();
    this.restoreActiveTabIndex();
  }

  onAttaching(): void {
    this.infiniteScrollDisabled = false;
  }

  onDetaching(): void {
    this.infiniteScrollDisabled = true;
    this.cdr.detectChanges();
  }

  onTabChanged(index: number): void {
    const previousIndex = this.activeTabIndex;
    if (this.activeTabIndex !== index) {
      this.storeActiveTabIndex(index);
    }
    this.switchFeed(previousIndex, index);
  }

  fetchBuzzes(retrying: boolean = false): void {
    const activeFeed = this.feeds[this.activeTabIndex];
    const { cursor, fetching, fetchFailed } = activeFeed;
    if (cursor === null || fetching || (fetchFailed && !retrying)) {
      return;
    }
    Object.assign(activeFeed, { fetchFailed: false, fetching: true });
    const pagination = { ...(cursor !== undefined && { cursor }), limit: 10 };
    this.buzzService
      .getBuzzesByCriterion({ criterion: activeFeed.criterion }, pagination)
      .pipe(finalize(() => (activeFeed.fetching = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          activeFeed.buzzes = [...new Set([...activeFeed.buzzes, ...data])];
          activeFeed.cursor = pagination.cursor;
        },
        error: () => (activeFeed.fetchFailed = true)
      });
  }

  private switchFeed(previousIndex: number, currentIndex: number): void {
    if (previousIndex !== currentIndex) {
      this.feeds[previousIndex].lastIndex =
        this.infiniteScrollWindowComponent.getIndexFromScrollPosition();
      if (this.feeds[currentIndex].lastIndex !== undefined) {
        this.infiniteScrollWindowComponent.scrollToIndex(
          this.feeds[currentIndex].lastIndex
        );
      }
    } else {
      this.resetFeed(this.feeds[currentIndex]);
    }
    if (this.feeds[currentIndex].buzzes.length === 0) {
      this.fetchBuzzes();
    }
  }

  private resetFeed(feed: Feed): void {
    Object.assign(feed, {
      buzzes: [],
      cursor: undefined,
      lastIndex: undefined,
      fetching: false,
      fetchFailed: false
    });
  }

  private initializeFeeds(): void {
    this.feeds = this.tabs.map(({ criterion }) => ({
      buzzes: [],
      criterion,
      fetching: false,
      fetchFailed: false
    }));
  }

  private storeActiveTabIndex(index: number): void {
    this.activeTabIndex = index;
    sessionStorage.setItem(HomeComponent.FEED_STORAGE_KEY, index.toString());
  }

  private restoreActiveTabIndex(): void {
    const storedIndex = sessionStorage.getItem(HomeComponent.FEED_STORAGE_KEY);
    this.activeTabIndex = storedIndex ? +storedIndex : 0;
    this.fetchBuzzes();
  }

  private subscribeToBuzzChanges(): void {
    this.buzzService.buzzChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((buzzChanges) => {
        this.feeds.forEach((feed) => {
          const index = feed.buzzes.findIndex((b) => b.id === buzzChanges.id);
          if (index !== -1) {
            if ((buzzChanges as { action: 'delete' }).action === 'delete') {
              feed.buzzes.splice(index, 1);
            } else {
              feed.buzzes[index] = merge(feed.buzzes[index], buzzChanges);
            }
          }
        });
      });
  }
}
