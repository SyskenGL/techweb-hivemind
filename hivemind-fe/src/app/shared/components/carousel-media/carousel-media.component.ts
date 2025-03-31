import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'hm-carousel-media',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './carousel-media.component.html'
})
export class CarouselMediaComponent {
  @Input() zoomable: boolean = true;
  @Input() set media(media: { type: 'image'; id: string | undefined }[]) {
    this._media = media.map((media) => ({ id: media.id, status: 'L' }));
    this.currentMediaIndex = 0;
  }

  @ViewChild('zoomInMediaModal')
  zoomInMediaModal!: ElementRef<HTMLDialogElement>;

  _media: { id: string | undefined; status: 'L' | 'E' | 'D' }[] = [];
  currentMediaIndex: number = 0;

  onMediaLoad(index: number): void {
    this._media[index].status = 'D';
  }

  onMediaError(index: number): void {
    this._media[index].status = 'E';
  }

  nextMedia(): void {
    this.currentMediaIndex += this.isLastMedia() ? 0 : 1;
  }

  previousMedia(): void {
    this.currentMediaIndex -= this.isFirstMedia() ? 0 : 1;
  }

  navigateToMedia(index: number): void {
    this.currentMediaIndex = index;
  }

  reloadMedia(index: number): void {
    this._media[index].status = 'L';
  }

  isFirstMedia(): boolean {
    return this.currentMediaIndex === 0;
  }

  isLastMedia(): boolean {
    return this.currentMediaIndex === this._media.length - 1;
  }

  zoomInMedia(): void {
    this.zoomable &&
      this._media[this.currentMediaIndex].status === 'D' &&
      this.zoomInMediaModal.nativeElement.showModal();
  }

  zoomOutMedia(): void {
    this.zoomInMediaModal.nativeElement.close();
  }

  shouldDisplayIndicators(): boolean {
    return this._media.length > 1;
  }
}
