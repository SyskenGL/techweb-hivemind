import { ImageLoaderConfig } from '@angular/common';
import urlJoin from 'url-join';
import { environment } from '@environments';

export const imageLoader = (config: ImageLoaderConfig) => {
  const baseUrl = new URL(
    urlJoin(environment.api.hivemind, `/v1/media/images/${config.src}`)
  );
  const queryParams = new URLSearchParams();
  if (config.width) {
    queryParams.append('width', config.width.toString());
    if (config.width && config.loaderParams?.['aspect-h']) {
      const width = config.loaderParams['aspect-w'] || config.width;
      const ratio = config.width / width;
      queryParams.append(
        'height',
        `${Math.trunc(config.loaderParams['aspect-h'] * ratio)}`
      );
    }
  }
  if (config.loaderParams?.['fit']) {
    queryParams.append('fit', config.loaderParams['fit']);
  }
  return `${baseUrl}?${queryParams}`;
};
