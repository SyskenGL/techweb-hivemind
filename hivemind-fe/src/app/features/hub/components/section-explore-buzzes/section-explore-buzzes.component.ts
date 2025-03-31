import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { Buzz } from '@core/models';
import {
  InfiniteScrollWindowComponent,
  ButtonRetryComponent,
  AnchorBuzzComponent
} from '@shared/components';
import { BuzzService } from '@core/services';
import { BuzzCriterion } from '@core/enums';

@Component({
  selector: 'hm-section-explore-buzzes',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollWindowComponent,
    ButtonRetryComponent,
    AnchorBuzzComponent
  ],
  templateUrl: './section-explore-buzzes.component.html'
})
export class SectionExploreBuzzesComponent implements OnInit, OnChanges {
  @Input() infiniteScrollDisabled: boolean = false;
  @Input() searchTerm?: string;

  private readonly destroy$: Subject<void> = new Subject<void>();

  buzzes: Buzz[] = [];
  fetchingBuzzes: boolean = false;
  buzzesFetchFailed: boolean = false;
  cursor?: string | null;

  constructor(private readonly buzzService: BuzzService) {}

  ngOnInit(): void {
    this.fetchBuzzes();
    this.subscribeToBuzzChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.fetchingBuzzes = false;
      this.buzzesFetchFailed = false;
      this.cursor = undefined;
      this.fetchBuzzes();
    }
  }

  fetchBuzzes(retrying: boolean = false): void {
    if (
      !this.searchTerm ||
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
      .getBuzzesByCriterion(
        {
          criterion: BuzzCriterion.HASHTAGS,
          values: this.searchTerm.split(/[\s,;]+/)
        },
        pagination
      )
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
