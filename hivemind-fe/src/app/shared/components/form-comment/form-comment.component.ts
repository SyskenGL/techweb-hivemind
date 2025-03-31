import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize, Observable, tap } from 'rxjs';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Buzz, Comment } from '@core/models';
import { BuzzService, CommentService } from '@core/services';
import { GenericValidators } from '@shared/validators';

@Component({
  selector: 'hm-form-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PickerComponent],
  templateUrl: './form-comment.component.html'
})
export class FormCommentComponent implements AfterViewInit, OnChanges {
  @Input() buzz!: Buzz;
  @Input() commentId!: string;
  @Input() content: string = '';
  @Input() updateMode: boolean = false;
  @Output() commentPosted: EventEmitter<Comment> = new EventEmitter();
  @Output() commentUpdated: EventEmitter<string> = new EventEmitter();
  @Output() updateCancelled: EventEmitter<void> = new EventEmitter();

  contentControl: FormControl<string>;
  showEmojiPicker: boolean = false;
  isTextAreaFocused: boolean = false;
  submitting: boolean = false;

  @ViewChildren('emojiPicker', { read: ElementRef })
  emojiPicker!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private readonly buzzService: BuzzService,
    private readonly commentService: CommentService,
    private readonly toastrService: ToastrService
  ) {
    this.contentControl = new FormControl<string>(this.content, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(200),
        GenericValidators.notOnlyWhitespaceOrNewline
      ]
    });
  }

  ngAfterViewInit(): void {
    this.updateTextAreaHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.contentControl.setValue(changes['content'].currentValue);
    }
  }

  onEmojiSelect(event: { emoji: EmojiData }): void {
    const cursorPos = this.textarea.nativeElement.selectionStart;
    const content = this.contentControl.value;
    const textBefore = content.substring(0, cursorPos);
    const textAfter = content.substring(cursorPos);
    const text = `${textBefore}${event.emoji.native}${textAfter}`;
    if (text.length < 200) {
      this.contentControl.setValue(text);
      requestAnimationFrame(() => {
        const newCursorPos = cursorPos + event.emoji.native!.length;
        this.textarea.nativeElement.setSelectionRange(
          newCursorPos,
          newCursorPos
        );
      });
      this.updateTextAreaHeight();
    }
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.contentControl.invalid) {
      return;
    }
    this.submitting = true;
    const action$: Observable<any> = this.updateMode
      ? this.commentService.updateComment(
          this.commentId,
          this.contentControl.value
        )
      : this.buzzService.addComment(this.buzz, this.contentControl.value);
    action$
      .pipe(
        tap((comment) => this.handlePostSubmission(comment)),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Comment Submission Failed'
          )
      });
  }

  onCancel(): void {
    if (this.updateMode) {
      this.updateCancelled.emit();
    } else {
      this.contentControl.setValue('');
      this.updateTextAreaHeight();
    }
  }

  updateTextAreaHeight(): void {
    requestAnimationFrame(() => {
      const textarea = this.textarea.nativeElement;
      textarea.style.height = 'auto';
      const height = Math.max(textarea.scrollHeight, 10);
      textarea.style.height = `${Math.min(height, 200)}px`;
    });
  }

  private handlePostSubmission(comment?: Comment): void {
    if (this.updateMode) {
      this.commentUpdated.emit(this.contentControl.value);
    } else {
      this.commentPosted.emit(comment as Comment);
    }
    this.onCancel();
  }
}
