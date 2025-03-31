import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { htmlToText } from 'html-to-text';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Sortable from 'sortablejs';
import { BuzzService, MediaService } from '@core/services';
import {
  HeaderStickyTemplateComponent,
  CarouselMediaComponent
} from '@shared/components';
import { GenericValidators } from '@shared/validators';
import { RouterizePipe } from '@shared/pipes';
import { markdown } from '@shared/helpers';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'hm-markdown-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderStickyTemplateComponent,
    PickerComponent,
    RouterizePipe,
    CarouselMediaComponent,
    NgOptimizedImage
  ],
  templateUrl: './create-buzz.component.html'
})
export class CreateBuzzComponent {
  createBuzzForm: FormGroup;
  showEmojiPicker: boolean = false;
  submitting: boolean = false;
  posted: boolean = false;

  @ViewChild('contentTextarea')
  contentTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('sortContainer') sortContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('editModal') editModal!: ElementRef<HTMLDialogElement>;
  @ViewChild(CarouselMediaComponent) carouselMedia!: CarouselMediaComponent;

  constructor(
    formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly mediaService: MediaService,
    private readonly buzzService: BuzzService,
    private readonly toastrService: ToastrService
  ) {
    this.createBuzzForm = formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(70),
          GenericValidators.notOnlyWhitespaceOrNewline
        ]
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(400),
          GenericValidators.notOnlyWhitespaceOrNewline
        ]
      ],
      mediaIds: formBuilder.array<{ type: 'image'; id: string | undefined }>(
        [],
        [Validators.maxLength(5)]
      )
    });
  }

  get title(): FormControl<string> {
    return this.createBuzzForm.get('title')! as FormControl<string>;
  }

  get content(): FormControl<string> {
    return this.createBuzzForm.get('content')! as FormControl<string>;
  }

  get mediaIds(): FormArray<
    FormControl<{ type: 'image'; id: string | undefined }>
  > {
    return this.createBuzzForm.get('mediaIds')! as FormArray<
      FormControl<{ type: 'image'; id: string | undefined }>
    >;
  }

  get contentPlainLength(): number {
    return htmlToText(this.html, {
      selectors: [{ selector: 'a', options: { ignoreHref: true } }]
    }).length;
  }

  get html(): string {
    return markdown.renderInline(this.content.value);
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.createBuzzForm.dirty || this.posted;
  }

  ngAfterViewInit(): void {
    Sortable.create(this.sortContainer.nativeElement, {
      animation: 150,
      onEnd: (event) => this.sortMedia(event.oldIndex!, event.newIndex!)
    });
  }

  onEmojiSelect(event: { emoji: EmojiData }): void {
    const cursorPos = this.contentTextarea.nativeElement.selectionStart;
    const content = this.content.value;
    const textBefore = content.substring(0, cursorPos);
    const textAfter = content.substring(cursorPos);
    const text = `${textBefore}${event.emoji.native}${textAfter}`;
    if (text.length < 200) {
      this.content.setValue(text);
      requestAnimationFrame(() => {
        const newCursorPos = cursorPos + event.emoji.native!.length;
        this.contentTextarea.nativeElement.setSelectionRange(
          newCursorPos,
          newCursorPos
        );
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileDrag(event: DragEvent): void {
    event.preventDefault();
  }

  onPost(): void {
    this.buzzService
      .postBuzz({
        title: this.title.value,
        content: this.content.value,
        media: this.mediaIds.value as { type: 'image'; id: string }[]
      })
      .subscribe({
        next: (buzzId) => {
          this.posted = true;
          this.router.navigateByUrl('/buzzes/' + buzzId);
        },
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Buzz Submission Failed'
          )
      });
  }

  addMarkdown(startTag: string, endTag: string) {
    const textarea = this.contentTextarea.nativeElement;
    const selectedText = this.content.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const text = selectedText
      ? `${startTag}${selectedText}${endTag}`
      : `${startTag}${endTag}`;
    this.content.setValue(
      this.content.value.substring(0, textarea.selectionStart) +
        text +
        this.content.value.substring(textarea.selectionEnd)
    );
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionStart + startTag.length;
      textarea.selectionEnd = textarea.selectionEnd + endTag.length;
    });
  }

  openEditModal(): void {
    this.editModal.nativeElement.showModal();
  }

  closeEditModal(): void {
    this.editModal.nativeElement.close();
  }

  sortMedia(oldIndex: number, newIndex: number): void {
    if (oldIndex === newIndex) return;
    const items = this.mediaIds.controls;
    const [movedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, movedItem);
    this.createBuzzForm.setControl('mediaIds', new FormArray(items));
  }

  removeMedia(index?: number): void {
    const removeIndex = index ?? this.carouselMedia.currentMediaIndex;
    this.mediaIds.removeAt(removeIndex);
    if (this.mediaIds.length === 0) {
      this.closeEditModal();
    }
  }

  private processFiles(selectedFiles: File[]): void {
    if (this.mediaIds.length + selectedFiles.length > 5) {
      return;
    }
    selectedFiles.forEach((file) => {
      const control = new FormControl<{
        type: 'image';
        id: string | undefined;
      }>(
        { type: 'image', id: undefined },
        {
          nonNullable: true,
          validators: [GenericValidators.propertyValidator((value) => value.id)]
        }
      );
      this.mediaIds.push(control);
      this.mediaIds.updateValueAndValidity();
      this.mediaService.uploadImage(file).subscribe({
        next: (id) => control.patchValue({ type: 'image', id }),
        error: () => {
          this.mediaIds.removeAt(
            this.mediaIds.controls.findIndex((ctrl) => ctrl === control)
          );
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Media Upload Failed'
          );
        }
      });
    });
  }
}
