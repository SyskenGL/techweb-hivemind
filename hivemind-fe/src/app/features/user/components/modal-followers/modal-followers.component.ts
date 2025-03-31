import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { UserService } from '@core/services';
import {
  ButtonRetryComponent,
  InfiniteScrollContainerComponent,
  MoleculeUserBylineComponent
} from '@shared/components';
import { User } from '@core/models';

@Component({
  selector: 'hm-modal-followers',
  standalone: true,
  imports: [
    CommonModule,
    MoleculeUserBylineComponent,
    InfiniteScrollContainerComponent,
    ButtonRetryComponent
  ],
  templateUrl: './modal-followers.component.html'
})
export class ModalFollowersComponent implements OnInit {
  @Input() userId!: string;

  closed: boolean = false;
  followers: User[] = [];
  cursor?: string | null;
  fetchingFollowers: boolean = false;
  followersFetchFailed: boolean = false;
  infiniteScrollDisabled: boolean = true;

  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(InfiniteScrollContainerComponent)
  infiniteScrollContainerComponent!: InfiniteScrollContainerComponent;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.subscribeToUserChanges();
  }

  open(): void {
    this.closed = false;
    this.infiniteScrollDisabled = false;
    this.modal.nativeElement.showModal();
    this.infiniteScrollContainerComponent.refreshMeasurement();
    if (this.followers.length === 0) {
      this.fetchFollowers();
    }
  }

  close(): void {
    this.closed = true;
    this.infiniteScrollDisabled = true;
    this.modal.nativeElement.close();
  }

  fetchFollowers(retrying = false): void {
    if (
      this.cursor === null ||
      this.fetchingFollowers ||
      (this.followersFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingFollowers = true;
    this.followersFetchFailed = false;
    const pagination = {
      ...(this.cursor ? { cursor: this.cursor } : {}),
      limit: 10
    };
    this.userService
      .getUserFollowers(this.userId, pagination)
      .pipe(finalize(() => (this.fetchingFollowers = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.followers = [...new Set([...this.followers, ...data])];
          this.cursor = pagination.cursor;
        },
        error: () => (this.followersFetchFailed = true)
      });
  }

  private subscribeToUserChanges(): void {
    this.userService.userChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userChanges) => {
        const index = this.followers.findIndex((b) => b.id === userChanges.id);
        if (index !== -1) {
          this.followers[index] = merge(this.followers[index], userChanges);
        }
      });
  }
}
