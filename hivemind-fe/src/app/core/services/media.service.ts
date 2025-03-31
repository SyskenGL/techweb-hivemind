import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import urlJoin from 'url-join';
import { environment } from '@environments';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  constructor(private readonly http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http
      .post<void>(
        urlJoin(environment.api.hivemind, '/v1/media/images'),
        formData,
        { observe: 'response' }
      )
      .pipe(
        map((response: any) => {
          const location = response.headers.get('location');
          const imageId = location.split('/').pop();
          return imageId;
        })
      );
  }
}
