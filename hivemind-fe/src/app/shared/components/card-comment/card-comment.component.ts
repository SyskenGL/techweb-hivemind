import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Buzz, Comment } from '@core/models';
import { InterceptRouterLinksDirective } from '@shared/directives';
import { RouterizePipe, ShortNumberPipe } from '@shared/pipes';
import { BuzzService, CommentService } from '@core/services';
import { MoleculeAuthorBylineComponent } from '../molecule-author-byline/molecule-author-byline.component';
import { FormCommentComponent } from '../form-comment/form-comment.component';

@Component({
  selector: 'hm-card-comment',
  standalone: true,
  imports: [
    CommonModule,
    MoleculeAuthorBylineComponent,
    InterceptRouterLinksDirective,
    RouterizePipe,
    ShortNumberPipe,
    FormCommentComponent
  ],
  templateUrl: './card-comment.component.html'
})
export class CardCommentComponent implements OnChanges, AfterViewInit {
  @Input() buzz!: Buzz;
  @Input() comment!: Comment;
  @Input() clamp: boolean = false;
  @Output() commentDeleted: EventEmitter<void> = new EventEmitter();

  @ViewChild('content') contentContainer!: ElementRef;

  togglingVote: 'up' | 'down' | null = null;
  deleting: boolean = false;
  editing: boolean = false;
  isContentExpanded: boolean = false;
  isTextAreaFocused: boolean = false;
  isLongContent: boolean = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly buzzService: BuzzService,
    private readonly commentService: CommentService,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit(): void {
    this.calculateExpanded();
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateExpanded();
  }

  onCommentUpdated(content: string) {
    this.comment = { ...this.comment, content };
  }

  toggleVote(vote: 'up' | 'down'): void {
    this.comment.interaction.vote === vote ? this.unvote() : this.vote(vote);
  }

  deleteComment(): void {
    this.deleting = true;
    this.buzzService
      .removeComment(this.buzz, this.comment.id)
      .pipe(
        tap(() => this.commentDeleted.emit()),
        finalize(() => (this.deleting = false))
      )
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Comment Deletion Failed'
          )
      });
  }

  private vote(vote: 'up' | 'down'): void {
    this.togglingVote = vote;
    this.commentService
      .vote(this.comment, vote)
      .pipe(finalize(() => (this.togglingVote = null)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Comment Vote Failed'
          )
      });
  }

  private unvote(): void {
    this.togglingVote = this.comment.interaction.vote;
    this.commentService
      .unvote(this.comment)
      .pipe(finalize(() => (this.togglingVote = null)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Comment Vote Failed'
          )
      });
  }

  private calculateExpanded(): void {
    if (!this.clamp || !this.contentContainer?.nativeElement) {
      this.isLongContent = false;
      return;
    }
    const element = this.contentContainer.nativeElement;
    const computedStyle = getComputedStyle(element);
    const lineHeight =
      parseFloat(computedStyle.getPropertyValue('line-height')) || 20;
    this.isLongContent = element.scrollHeight > lineHeight * 6;
  }
}
