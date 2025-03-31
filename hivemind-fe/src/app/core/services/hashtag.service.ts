import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import urlJoin from 'url-join';
import { environment } from '@environments';
import { HashtagEngagement } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class HashtagService {
  constructor(private readonly http: HttpClient) {}

  getTrendingHashtags(): Observable<HashtagEngagement[]> {
    return this.http.get<HashtagEngagement[]>(
      urlJoin(environment.api.hivemind, '/v1/hashtags')
    );
  }
}
