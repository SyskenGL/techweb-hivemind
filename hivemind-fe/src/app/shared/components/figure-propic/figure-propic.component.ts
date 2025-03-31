import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'hm-figure-propic',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './figure-propic.component.html'
})
export class FigurePropicComponent {
  @Input() priority: boolean = false;
  @Input() propicId?: string | null = null;
  @Input() border: boolean = false;
  @Input() zoomable: boolean = false;

  @ViewChild('zoomInPropicModal')
  zoomInPropicModal?: ElementRef<HTMLDialogElement>;

  status: 'L' | 'E' | 'D' = 'L';

  onPropicLoad(): void {
    this.status = 'D';
  }

  onPropicError(): void {
    this.status = 'E';
  }

  zoomInPropic(): void {
    this.zoomInPropicModal && this.zoomInPropicModal.nativeElement.showModal();
  }
}
