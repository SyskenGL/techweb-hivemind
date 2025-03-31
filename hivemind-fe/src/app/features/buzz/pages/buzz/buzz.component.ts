import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, catchError, map, of, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { BuzzService } from '@core/services';
import { Buzz } from '@core/models';
import {
  CardBuzzComponent,
  HeaderStickyTemplateComponent,
  ButtonRetryComponent,
  SkeletonCardBuzzComponent
} from '@shared/components';
import { SectionBuzzCommentsComponent } from '@features/buzz/components';

@Component({
  selector: 'hm-buzz',
  standalone: true,
  imports: [
    CommonModule,
    CardBuzzComponent,
    HeaderStickyTemplateComponent,
    ButtonRetryComponent,
    SkeletonCardBuzzComponent,
    SectionBuzzCommentsComponent
  ],
  templateUrl: './buzz.component.html'
})
export class BuzzComponent implements OnInit, OnDestroy {
  buzz$ = new BehaviorSubject<Buzz | null | undefined>(undefined);
  buzzFetchFailed: boolean = false;
  infiniteScrollCommentsDisabled: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly buzzService: BuzzService,
    private readonly cdr: ChangeDetectorRef,
    readonly location: Location
  ) {}

  ngOnInit(): void {
    this.fetchBuzz();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchBuzz(retrying: boolean = false): void {
    if (this.buzzFetchFailed && !retrying) {
      return;
    }
    this.buzzFetchFailed = false;
    const buzzId = this.route.snapshot.paramMap.get('id')!;
    this.buzzService
      .getBuzzById(buzzId)
      .pipe(
        map((buzz) => {
          this.buzz$.next(buzz);
          this.title.setTitle(`${this.title.getTitle()} - ${buzz.title}`);
          this.subscribeToBuzzChanges();
        }),
        catchError(({ status }: HttpErrorResponse) => {
          if (status !== HttpStatusCode.NotFound) {
            this.buzzFetchFailed = true;
          } else {
            this.router.navigateByUrl('/home');
          }
          return of(null);
        })
      )
      .subscribe();
  }

  private subscribeToBuzzChanges(): void {
    this.buzzService.buzzChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((buzzChanges) => {
        if (buzzChanges.id === this.buzz$.getValue()?.id) {
          const user = merge(this.buzz$.getValue(), buzzChanges);
          this.buzz$.next(user);
        }
      });
  }
}
