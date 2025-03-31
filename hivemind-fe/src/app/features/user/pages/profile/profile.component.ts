import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Component, OnDestroy, OnInit, Signal, viewChild } from '@angular/core';
import { merge } from 'lodash-es';
import { BehaviorSubject, catchError, map, of, Subject, takeUntil } from 'rxjs';
import { User } from '@core/models';
import { UserService } from '@core/services';
import {
  ButtonFollowComponent,
  ButtonRetryComponent,
  HeaderStickyTemplateComponent
} from '@shared/components';
import {
  SectionProfileMainComponent,
  SectionProfileBuzzesComponent,
  ModalEditProfileComponent,
  ModalFollowingsComponent,
  ModalFollowersComponent
} from '@features/user/components';

@Component({
  selector: 'hm-profile',
  standalone: true,
  imports: [
    CommonModule,
    SectionProfileMainComponent,
    ButtonRetryComponent,
    SectionProfileBuzzesComponent,
    HeaderStickyTemplateComponent,
    ButtonFollowComponent,
    ModalEditProfileComponent,
    ModalFollowingsComponent,
    ModalFollowersComponent
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user$: BehaviorSubject<User | null | undefined> = new BehaviorSubject<
    User | null | undefined
  >(undefined);
  userFetchFailed: boolean = false;
  showBadgeOnHeader: boolean = false;

  modalFollowersComponent: Signal<ModalFollowersComponent | undefined> =
    viewChild(ModalFollowersComponent);
  modalFollowingsComponent: Signal<ModalFollowingsComponent | undefined> =
    viewChild(ModalFollowingsComponent);
  modalEditProfileComponent: Signal<ModalEditProfileComponent | undefined> =
    viewChild(ModalEditProfileComponent);

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly userService: UserService,
    readonly location: Location
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    if (
      userId === this.userService.currentUser?.id ||
      userId === this.userService.currentUser?.username
    ) {
      this.userService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe((user) => {
          this.user$.next(user);
          this.title.setTitle(
            `${this.title.getTitle()} - ${user!.profile.fullName} (@${user!.username})`
          );
        });
    } else {
      this.fetchProfile();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchProfile(retrying: boolean = false): void {
    if (this.userFetchFailed && !retrying) {
      return;
    }
    this.userFetchFailed = false;
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.userService
      .getUserById(userId)
      .pipe(
        map((user) => {
          this.user$.next(user);
          this.title.setTitle(
            `${this.title.getTitle()} - ${user.profile.fullName} (@${user.username})`
          );
          this.subscribeToUserChanges();
        }),
        catchError(({ status }: HttpErrorResponse) => {
          if (status === HttpStatusCode.NotFound) {
            this.user$.next(null);
          } else {
            this.userFetchFailed = true;
          }
          return of(null);
        })
      )
      .subscribe();
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
