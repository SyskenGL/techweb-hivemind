import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  NgZone,
  OnDestroy
} from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  transform(value: string): string | null {
    clearTimeout(this.timer);
    const date = new Date(value);
    const now = new Date();
    if (isNaN(date.getTime()) || date > now) {
      return null;
    }
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    this.scheduleNextUpdate(seconds);
    return this.formatTimeAgo(seconds);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private formatTimeAgo(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.416);
    const years = Math.round(days / 365);
    if (seconds <= 45) {
      return 'a few seconds ago';
    }
    if (seconds <= 90) {
      return 'a minute ago';
    }
    if (minutes <= 45) {
      return `${minutes} minutes ago`;
    }
    if (minutes <= 90) {
      return 'an hour ago';
    }
    if (hours <= 22) {
      return `${hours} hours ago`;
    }
    if (hours <= 36) {
      return 'a day ago';
    }
    if (days <= 25) {
      return `${days} days ago`;
    }
    if (days <= 45) {
      return 'a month ago';
    }
    if (days <= 345) {
      return `${months} months ago`;
    }
    if (days <= 545) {
      return 'a year ago';
    }
    return `${years} years ago`;
  }

  private getSecondsUntilNextUpdate(seconds: number): number {
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    if (seconds < minute) {
      return 2;
    }
    if (seconds < hour) {
      return 30;
    }
    if (seconds < day) {
      return 300;
    }
    if (seconds < day * 7) {
      return 900;
    }
    if (seconds < day * 30) {
      return 3600;
    }
    if (seconds < day * 365) {
      return 7200;
    }
    return 43200;
  }

  private scheduleNextUpdate(seconds: number): void {
    const timeToUpdate = this.getSecondsUntilNextUpdate(seconds) * 1000;
    this.timer = this.ngZone.runOutsideAngular(() => {
      return setTimeout(() => {
        this.ngZone.run(() => this.cdr.markForCheck());
      }, timeToUpdate);
    });
  }
}
