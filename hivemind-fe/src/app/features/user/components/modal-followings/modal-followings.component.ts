import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { User } from '@core/models';
import { UserService } from '@core/services';
import {
  ButtonRetryComponent,
  InfiniteScrollContainerComponent,
  MoleculeUserBylineComponent
} from '@shared/components';

@Component({
  selector: 'hm-modal-followings',
  standalone: true,
  imports: [
    CommonModule,
    MoleculeUserBylineComponent,
    InfiniteScrollContainerComponent,
    ButtonRetryComponent
  ],
  templateUrl: './modal-followings.component.html'
})
export class ModalFollowingsComponent implements OnInit {
  @Input() userId!: string;

  closed: boolean = true;
  followings: User[] = [];
  cursor?: string | null;
  fetchingFollowings: boolean = false;
  followingsFetchFailed: boolean = false;
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
    if (this.followings.length === 0) {
      this.fetchFollowings();
    }
  }

  close(): void {
    this.closed = true;
    this.infiniteScrollDisabled = true;
    this.modal.nativeElement.close();
  }

  fetchFollowings(retrying = false): void {
    if (
      this.closed === true ||
      this.cursor === null ||
      this.fetchingFollowings ||
      (this.followingsFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingFollowings = true;
    this.followingsFetchFailed = false;
    const pagination = {
      ...(this.cursor ? { cursor: this.cursor } : {}),
      limit: 10
    };
    this.userService
      .getUserFollowings(this.userId, pagination)
      .pipe(finalize(() => (this.fetchingFollowings = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.followings = [...new Set([...this.followings, ...data])];
          this.cursor = pagination.cursor;
        },
        error: () => (this.followingsFetchFailed = true)
      });
  }

  private subscribeToUserChanges(): void {
    this.userService.userChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userChanges) => {
        const index = this.followings.findIndex((b) => b.id === userChanges.id);
        if (index !== -1) {
          this.followings[index] = merge(this.followings[index], userChanges);
        }
      });
  }
}
