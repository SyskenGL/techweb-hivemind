import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { PowerGlitch } from 'powerglitch';
import { User } from '@core/models';
import { AuthService, UserService } from '@core/services';
import { MoleculeUserBylineComponent } from '../molecule-user-byline/molecule-user-byline.component';
import { ToggleSwitchThemeComponent } from '../toggle-switch-theme/toggle-switch-theme.component';
import { FigurePropicPopoverComponent } from '../figure-propic-popover/figure-propic-popover.component';

@Component({
  selector: 'hm-navbar-aside-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MoleculeUserBylineComponent,
    ToggleSwitchThemeComponent,
    FigurePropicPopoverComponent
  ],
  templateUrl: './navbar-aside-main.component.html'
})
export class NavbarAsideMainComponent implements OnDestroy, AfterViewInit {
  currentUser?: User;

  @ViewChild('logo') logo!: ElementRef<HTMLElement>;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(
    readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.currentUser = user));
  }

  ngAfterViewInit(): void {
    PowerGlitch.glitch(this.logo.nativeElement, {
      playMode: 'hover',
      timing: { duration: 1000, easing: 'linear' }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSignOut(): void {
    this.authService
      .signOut()
      .pipe(finalize(() => this.router.navigateByUrl('/')))
      .subscribe();
  }
}
