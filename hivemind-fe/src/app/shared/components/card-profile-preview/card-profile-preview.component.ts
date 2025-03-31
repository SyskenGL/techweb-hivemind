import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { UserService } from '@core/services';
import { User } from '@core/models';
import { ShortNumberPipe } from '@shared/pipes';
import { FigureCoverComponent } from '../figure-cover/figure-cover.component';
import { FigurePropicComponent } from '../figure-propic/figure-propic.component';
import { SkeletonProfilePreviewComponent } from '../skeleton-profile-preview/skeleton-profile-preview.component';
import { ButtonFollowComponent } from '../button-follow/button-follow.component';

@Component({
  selector: 'hm-card-profile-preview',
  standalone: true,
  imports: [
    CommonModule,
    ShortNumberPipe,
    FigureCoverComponent,
    FigurePropicComponent,
    SkeletonProfilePreviewComponent,
    RouterLink,
    ButtonFollowComponent
  ],
  templateUrl: './card-profile-preview.component.html'
})
export class CardProfilePreviewComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Output() profilePreviewLoaded: EventEmitter<boolean> = new EventEmitter();

  user$ = new BehaviorSubject<User | undefined>(undefined);
  togglingFollow: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();
  private subscription?: Subscription;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  ngOnDestroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasSocials(): boolean {
    const user = this.user$.getValue();
    return (
      !!user &&
      !!(
        user.profile.facebookUrl ||
        user.profile.instagramUrl ||
        user.profile.twitterUrl ||
        user.profile.linkedInUrl ||
        user.profile.websiteUrl
      )
    );
  }

  private fetchProfile(): void {
    if (
      this.userId === this.userService.currentUser?.id ||
      this.userId === this.userService.currentUser?.username
    ) {
      this.userService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe((user) => {
          this.user$.next(user);
        });
    } else {
      this.subscription = this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.user$.next(user);
          this.subscribeToUserChanges();
          this.profilePreviewLoaded.next(true);
        },
        error: () => this.profilePreviewLoaded.next(false)
      });
    }
  }

  private subscribeToUserChanges(): void {
    this.userService.userChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userChanges) => {
        if (userChanges.id === this.user$.getValue()?.id) {
          const user = merge(this.user$.getValue(), userChanges);
          this.user$.next(user);
        }
      });
  }
}
