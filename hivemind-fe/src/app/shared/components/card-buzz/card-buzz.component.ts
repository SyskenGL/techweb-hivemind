import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Buzz } from '@core/models';
import { BuzzService } from '@core/services';
import { RouterizePipe, ShortNumberPipe } from '@shared/pipes';
import {
  InterceptRouterLinksDirective,
  StopClickPropagationDirective
} from '@shared/directives';
import { CarouselMediaComponent } from '../carousel-media/carousel-media.component';
import { MoleculeAuthorBylineComponent } from '../molecule-author-byline/molecule-author-byline.component';

@Component({
  selector: 'hm-card-buzz',
  standalone: true,
  imports: [
    CommonModule,
    CarouselMediaComponent,
    ShortNumberPipe,
    StopClickPropagationDirective,
    MoleculeAuthorBylineComponent,
    RouterizePipe,
    InterceptRouterLinksDirective
  ],
  templateUrl: './card-buzz.component.html'
})
export class CardBuzzComponent {
  @Input() buzz!: Buzz;
  @Input() clamp: boolean = false;
  @Output() buzzDeleted: EventEmitter<void> = new EventEmitter();

  togglingVote: 'up' | 'down' | null = null;
  togglingBookmark: boolean = false;
  deleting: boolean = false;

  constructor(
    private readonly buzzService: BuzzService,
    private readonly toastrService: ToastrService
  ) {}

  get shareLink(): string {
    return `${window.location.origin}/buzzes/${this.buzz.id}`;
  }

  toggleVote(vote: 'up' | 'down'): void {
    this.buzz.interaction.vote === vote ? this.unvote() : this.vote(vote);
  }

  toggleBookmark(): void {
    this.buzz.interaction.bookmarked ? this.unbookmark() : this.bookmark();
  }

  share() {
    navigator.share && navigator.share({ url: this.shareLink });
  }

  deleteBuzz(): void {
    this.deleting = true;
    this.buzzService
      .deleteBuzz(this.buzz.id)
      .pipe(
        tap(() => this.buzzDeleted.emit()),
        finalize(() => (this.deleting = false))
      )
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Deletion Failed'
          )
      });
  }

  private vote(vote: 'up' | 'down'): void {
    this.togglingVote = vote;
    this.buzzService
      .vote(this.buzz, vote)
      .pipe(finalize(() => (this.togglingVote = null)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Vote Failed'
          )
      });
  }

  private unvote(): void {
    this.togglingVote = this.buzz.interaction.vote;
    this.buzzService
      .unvote(this.buzz)
      .pipe(finalize(() => (this.togglingVote = null)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Vote Failed'
          )
      });
  }

  private bookmark(): void {
    this.togglingBookmark = true;
    this.buzzService
      .bookmark(this.buzz)
      .pipe(finalize(() => (this.togglingBookmark = false)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Bookmark Failed'
          )
      });
  }

  private unbookmark(): void {
    this.togglingBookmark = true;
    this.buzzService
      .unbookmark(this.buzz)
      .pipe(finalize(() => (this.togglingBookmark = false)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Bookmark Failed'
          )
      });
  }
}
