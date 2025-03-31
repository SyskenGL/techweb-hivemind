import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { User } from '@core/models';
import { UserService } from '@core/services';
import { MoleculeUserBylineComponent } from '../molecule-user-byline/molecule-user-byline.component';
import { ButtonRetryComponent } from '../button-retry/button-retry.component';

@Component({
  selector: 'hm-card-suggested-users',
  standalone: true,
  imports: [CommonModule, MoleculeUserBylineComponent, ButtonRetryComponent],
  templateUrl: './card-suggested-users.component.html'
})
export class CardSuggestedUsersComponent implements OnInit {
  suggestedUsers: User[] = [];
  fetchingSuggestedUsers: boolean = false;
  suggestedUsersFetchFailed: boolean = false;

  private readonly destroy$: Subject<void> = new Subject<void>();

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.fetchSuggestedUsers();
    this.subscribeToUserChanges();
  }

  fetchSuggestedUsers(retrying = false): void {
    if (
      this.suggestedUsers.length > 0 ||
      this.fetchingSuggestedUsers ||
      (this.suggestedUsersFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingSuggestedUsers = true;
    this.suggestedUsersFetchFailed = false;
    this.userService
      .getSuggestedUsers()
      .pipe(finalize(() => (this.fetchingSuggestedUsers = false)))
      .subscribe({
        next: (data) => (this.suggestedUsers = data),
        error: () => (this.suggestedUsersFetchFailed = true)
      });
  }

  private subscribeToUserChanges(): void {
    this.userService.userChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userChanges) => {
        const index = this.suggestedUsers.findIndex(
          (b) => b.id === userChanges.id
        );
        if (index !== -1) {
          this.suggestedUsers[index] = merge(
            this.suggestedUsers[index],
            userChanges
          );
        }
      });
  }
}
