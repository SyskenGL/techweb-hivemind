import { Component, Input, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { Buzz } from '@core/models';
import { BuzzService, JwtService } from '@core/services';
import {
  InfiniteScrollWindowComponent,
  AnchorBuzzComponent,
  ButtonRetryComponent
} from '@shared/components';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hm-section-profile-buzzes',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollWindowComponent,
    AnchorBuzzComponent,
    ButtonRetryComponent
  ],
  templateUrl: './section-profile-buzzes.component.html'
})
export class SectionProfileBuzzesComponent implements OnInit {
  @Input() userId!: string;
  @Input() username!: string;

  isCurrentUser: boolean = false;
  buzzes: Buzz[] = [];
  cursor?: string | null;
  fetchingBuzzes: boolean = false;
  buzzesFetchFailed: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly buzzService: BuzzService,
    private readonly jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.isCurrentUser = this.jwtService.getSub() === this.userId;
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
      .getUserBuzzes(this.userId, pagination)
      .pipe(finalize(() => (this.fetchingBuzzes = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.buzzes = this.buzzes.concat(data);
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
