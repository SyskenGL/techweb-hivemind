import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { merge } from 'lodash-es';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Buzz } from '@core/models';
import { BuzzService } from '@core/services';
import {
  InfiniteScrollWindowComponent,
  AnchorBuzzComponent,
  ButtonRetryComponent,
  HeaderStickyTemplateComponent
} from '@shared/components';

@Component({
  selector: 'hm-bookmarks',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollWindowComponent,
    AnchorBuzzComponent,
    ButtonRetryComponent,
    HeaderStickyTemplateComponent
  ],
  templateUrl: './bookmarks.component.html'
})
export class BookmarksComponent {
  infiniteScrollDisabled: boolean = false;
  buzzes: Buzz[] = [];
  cursor?: string | null;
  lastValidCursor?: string;
  fetchingBuzzes: boolean = false;
  buzzesFetchFailed: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(private readonly buzzService: BuzzService) {}

  ngOnInit(): void {
    this.subscribeToBuzzChanges();
    this.fetchBuzzes();
  }

  fetchBuzzes(retrying = false): void {
    if (
      this.cursor === null ||
      this.fetchingBuzzes ||
      (this.buzzesFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingBuzzes = true;
    this.buzzesFetchFailed = false;
    const pagination = {
      ...(this.cursor ? { cursor: this.cursor } : {}),
      limit: 10
    };
    this.buzzService
      .getUserBookmarks(pagination)
      .pipe(finalize(() => (this.fetchingBuzzes = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.buzzes = this.buzzes.concat(data);
          this.lastValidCursor = pagination.cursor ?? this.cursor!;
          this.cursor = pagination.cursor;
        },
        error: () => (this.buzzesFetchFailed = true)
      });
  }

  private subscribeToBuzzChanges(): void {
    this.buzzService.buzzChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((buzzChanges) => {
        const index = this.buzzes.findIndex((b) => b.id === buzzChanges.id);
        if (index !== -1) {
          if ((buzzChanges as { action: 'delete' }).action === 'delete') {
            this.buzzes.splice(index, 1);
          } else {
            this.buzzes[index] = merge(this.buzzes[index], buzzChanges);
          }
        }
      });
  }
}
