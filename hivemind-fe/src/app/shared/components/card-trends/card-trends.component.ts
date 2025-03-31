import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HashtagService } from '@core/services';
import { HashtagEngagement } from '@core/models';
import { ButtonRetryComponent } from '../button-retry/button-retry.component';

@Component({
  selector: 'hm-card-trends',
  standalone: true,
  imports: [CommonModule, ButtonRetryComponent, DatePipe],
  templateUrl: './card-trends.component.html'
})
export class CardTrendsComponent {
  trends: HashtagEngagement[] = [];
  fetchingTrends: boolean = false;
  trendsFetchFailed: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly hashtagService: HashtagService
  ) {}

  ngOnInit(): void {
    this.fetchTrends();
  }

  onClick(trend: HashtagEngagement): void {
    this.router.navigate(['/explore'], {
      queryParams: { q: trend.name, s: 'buzzes' }
    });
  }

  fetchTrends(retrying = false): void {
    if (
      this.trends.length > 0 ||
      this.fetchingTrends ||
      (this.trendsFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingTrends = true;
    this.trendsFetchFailed = false;
    this.hashtagService
      .getTrendingHashtags()
      .pipe(finalize(() => (this.fetchingTrends = false)))
      .subscribe({
        next: (data) => (this.trends = data),
        error: () => (this.trendsFetchFailed = true)
      });
  }
}
