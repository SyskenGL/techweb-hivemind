import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'hm-figure-cover',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './figure-cover.component.html'
})
export class FigureCoverComponent {
  @Input() priority: boolean = false;
  @Input() coverId?: string | null = null;
  @Input() zoomable: boolean = false;

  @ViewChild('zoomInCoverModal')
  zoomInCoverModal?: ElementRef<HTMLDialogElement>;

  status: 'L' | 'E' | 'D' = 'L';

  onCoverLoad(): void {
    this.status = 'D';
  }

  onCoverError(): void {
    this.status = 'E';
  }

  zoomInCover(): void {
    this.zoomInCoverModal && this.zoomInCoverModal.nativeElement.showModal();
  }
}
