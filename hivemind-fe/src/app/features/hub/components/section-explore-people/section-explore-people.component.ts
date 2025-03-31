import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { merge } from 'lodash-es';
import { User } from '@core/models';
import { UserService } from '@core/services';
import {
  ButtonRetryComponent,
  InfiniteScrollWindowComponent,
  MoleculeUserBylineComponent
} from '@shared/components';

@Component({
  selector: 'hm-section-explore-people',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollWindowComponent,
    MoleculeUserBylineComponent,
    ButtonRetryComponent
  ],
  templateUrl: './section-explore-people.component.html'
})
export class SectionExplorePeopleComponent implements OnInit, OnChanges {
  @Input() infiniteScrollDisabled: boolean = false;
  @Input() searchTerm?: string;

  private readonly destroy$: Subject<void> = new Subject<void>();

  people: User[] = [];
  fetchingPeople: boolean = false;
  peopleFetchFailed: boolean = false;
  cursor?: string | null;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.fetchPeople();
    this.subscribeToUserChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.fetchingPeople = false;
      this.peopleFetchFailed = false;
      this.cursor = undefined;
      this.fetchPeople();
    }
  }

  fetchPeople(retrying: boolean = false): void {
    if (
      !this.searchTerm ||
      this.cursor === null ||
      this.fetchingPeople ||
      (this.peopleFetchFailed && !retrying)
    ) {
      return;
    }
    this.fetchingPeople = true;
    this.peopleFetchFailed = false;
    const pagination = {
      ...(this.cursor ? { cursor: this.cursor } : {}),
      limit: 10
    };
    this.userService
      .getUsersBySearchTerm(this.searchTerm, pagination)
      .pipe(finalize(() => (this.fetchingPeople = false)))
      .subscribe({
        next: ({ data, pagination }) => {
          this.people = this.people.concat(data);
          this.cursor = pagination.cursor;
        },
        error: () => (this.peopleFetchFailed = true)
      });
  }

  private subscribeToUserChanges(): void {
    this.userService.userChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userChanges) => {
        const index = this.people.findIndex((b) => b.id === userChanges.id);
        if (index !== -1) {
          this.people[index] = merge(this.people[index], userChanges);
        }
      });
  }
}
