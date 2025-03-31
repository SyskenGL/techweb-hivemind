import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { Buzz, Comment, User } from '@core/models';
import { CommentService, UserService } from '@core/services';
import {
  CardCommentComponent,
  ButtonRetryComponent,
  InfiniteScrollWindowComponent,
  FigurePropicPopoverComponent,
  FormCommentComponent,
  FigurePropicComponent
} from '@shared/components';

@Component({
  selector: 'hm-section-buzz-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InfiniteScrollWindowComponent,
    CardCommentComponent,
    ButtonRetryComponent,
    FigurePropicPopoverComponent,
    FormCommentComponent,
    FigurePropicComponent
  ],
  templateUrl: './section-buzz-comments.component.html'
})
export class SectionBuzzCommentsComponent implements OnInit, OnDestroy {
  @Input() buzz!: Buzz;
  @Input() infiniteScrollDisabled: boolean = false;

  comments: Comment[] = [];
  cursor?: string | null;
  fetchingComments: boolean = false;
  commentsFetchFailed: boolean = false;
  currentUser!: User | null;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService
  ) {
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.currentUser = user!));
  }

  ngOnInit(): void {
    this.subscribeToCommentChanges();
    this.fetchComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCommentPosted(comment: Comment) {
    this.comments = [comment, ...this.comments];
  }

  onCommentDeleted(index: number) {
    this.comments = [
      ...this.comments.slice(0, index),
      ...this.comments.slice(index + 1)
    ];
  }

  fetchComments(retrying = false): void {
    if (
      this.cursor === null ||
      this.fetchingComments ||
      (this.commentsFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingComments = true;
    this.commentsFetchFailed = false;
    const pagination = {
      ...(this.cursor ? { cursor: this.cursor } : {}),
      limit: 10
    };
    this.commentService
      .getBuzzComments(this.buzz.id, pagination)
      .pipe(finalize(() => (this.fetchingComments = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.comments = this.comments.concat(data);
          this.cursor = pagination.cursor;
        },
        error: () => (this.commentsFetchFailed = true)
      });
  }

  private subscribeToCommentChanges(): void {
    this.commentService.commentChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((commentChanges) => {
        const index = this.comments.findIndex(
          (b) => b.id === commentChanges.id
        );
        if (index !== -1) {
          this.comments[index] = merge(this.comments[index], commentChanges);
        }
      });
  }
}
