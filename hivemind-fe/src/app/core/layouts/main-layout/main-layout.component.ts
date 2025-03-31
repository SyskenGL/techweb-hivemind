import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CardSuggestedUsersComponent,
  CardTrendsComponent,
  FooterNavPlainComponent,
  NavbarAsideMainComponent
} from '@shared/components';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'hm-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardSuggestedUsersComponent,
    CardTrendsComponent,
    FooterNavPlainComponent,
    NavbarAsideMainComponent
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showDrawer: boolean = false;
  isSmallScreen: boolean = false;

  private readonly destroy$: Subject<void> = new Subject();

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 640px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
        this.showDrawer = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
