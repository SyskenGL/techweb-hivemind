import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  HeaderStickyTemplateComponent,
  TabUnderlineSelectorComponent
} from '@shared/components';
import {
  SectionExploreBuzzesComponent,
  SectionExplorePeopleComponent
} from '@features/hub/components';

@Component({
  selector: 'hm-explore',
  standalone: true,
  imports: [
    CommonModule,
    HeaderStickyTemplateComponent,
    TabUnderlineSelectorComponent,
    SectionExploreBuzzesComponent,
    SectionExplorePeopleComponent,
    ReactiveFormsModule
  ],
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit {
  static readonly RECENT_SEARCHES_STORAGE_KEY = 'hm-search-history';

  activeTabIndex = 0;
  searchControl = new FormControl<string>('', { nonNullable: true });
  recentSearches: string[] = [];
  searchTerm?: string;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.loadRecentSearches();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.initializeSearchParams(params);
    });
  }

  clearHistory(): void {
    sessionStorage.removeItem(ExploreComponent.RECENT_SEARCHES_STORAGE_KEY);
    this.recentSearches = [];
  }

  clearSearch(index: number, event: Event): void {
    event.stopPropagation();
    this.recentSearches.splice(index, 1);
    this.updateRecentSearches();
  }

  onTabChanged(index: number): void {
    this.activeTabIndex = index;
    const section = index === 0 ? 'buzzes' : 'people';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { s: section },
      queryParamsHandling: 'merge'
    });
  }

  onSearch(): void {
    const searchTerm = this.searchControl.value.trim();
    if (!searchTerm) {
      return;
    }
    if (!this.recentSearches.includes(searchTerm)) {
      this.recentSearches.unshift(searchTerm);
      if (this.recentSearches.length > 10) {
        this.recentSearches.pop();
      }
      sessionStorage.setItem(
        ExploreComponent.RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(this.recentSearches)
      );
    }
    this.searchTerm = searchTerm;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchControl.value },
      queryParamsHandling: 'merge'
    });
  }

  onRecentSearch(recentSearch: string) {
    if (recentSearch === this.searchTerm) {
      return;
    }
    this.recentSearches.splice(this.recentSearches.indexOf(recentSearch), 1);
    this.recentSearches.unshift(recentSearch);
    sessionStorage.setItem(
      ExploreComponent.RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(this.recentSearches)
    );
    this.searchControl.setValue(recentSearch);
    this.onSearch();
  }

  private loadRecentSearches() {
    const storedSearches = sessionStorage.getItem(
      ExploreComponent.RECENT_SEARCHES_STORAGE_KEY
    );
    this.recentSearches = storedSearches ? JSON.parse(storedSearches) : [];
  }

  private initializeSearchParams(params: any): void {
    if (params['q']) {
      this.searchControl.setValue(params['q']);
      this.searchTerm = params['q'];
    }
    if (params['s']) {
      this.activeTabIndex = params['s'] === 'buzzes' ? 0 : 1;
    }
  }

  private updateRecentSearches(): void {
    sessionStorage.setItem(
      ExploreComponent.RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(this.recentSearches)
    );
  }
}
