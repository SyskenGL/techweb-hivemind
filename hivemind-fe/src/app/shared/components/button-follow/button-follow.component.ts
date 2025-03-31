import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from '@core/models';
import { UserService } from '@core/services';

@Component({
  selector: 'hm-button-follow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-follow.component.html'
})
export class ButtonFollowComponent {
  @Input() user!: User;
  @Input() fullWidth: boolean = false;

  togglingFollow: boolean = false;

  constructor(
    private readonly userService: UserService,
    private readonly toastrService: ToastrService
  ) {}

  toggleFollow(): void {
    this.updateFollowStatus(
      this.user.relation?.followed ? 'unfollow' : 'follow'
    );
  }

  private async updateFollowStatus(action: 'follow' | 'unfollow') {
    this.togglingFollow = true;
    this.userService[action](this.user)
      .pipe(finalize(() => (this.togglingFollow = false)))
      .subscribe({
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            action === 'follow' ? 'User Follow Failed' : 'User Unfollow Failed'
          )
      });
  }
}
