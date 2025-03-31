import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxLoadingBar } from '@ngx-loading-bar/core';
import { AuthService, ThemeService } from '@core/services';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'hm-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxLoadingBar],
  templateUrl: './app.component.html'
})
export class AppComponent {
  isLoadingCurrentUser = true;

  constructor(
    private readonly router: Router,
    private readonly themeService: ThemeService,
    private readonly authService: AuthService,
    private readonly toastrService: ToastrService
  ) {
    this.authService.loadCurrentUser().subscribe({
      next: () => {
        this.isLoadingCurrentUser = false;
      },
      error: () => {
        this.toastrService.error(
          'Whoops! Something went wrong. Please signin again.',
          'Authentication Error'
        );
        this.authService
          .signOut()
          .pipe(
            finalize(() => {
              this.isLoadingCurrentUser = false;
              this.router.navigateByUrl('/');
            })
          )
          .subscribe();
      }
    });
  }
}
