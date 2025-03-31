import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PowerGlitch } from 'powerglitch';

@Component({
  selector: 'hm-figure-glitched-logo',
  standalone: true,
  imports: [],
  templateUrl: './figure-glitched-logo.component.html'
})
export class FigureGlitchedLogoComponent implements AfterViewInit {
  @ViewChild('logo') logo!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    PowerGlitch.glitch(this.logo.nativeElement, {
      timing: { duration: 15000, easing: 'linear' },
      glitchTimeSpan: { start: 0.65, end: 0.7 }
    });
  }
}
