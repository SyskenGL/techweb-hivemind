import {
  ActivatedRouteSnapshot,
  RouteReuseStrategy,
  DetachedRouteHandle
} from '@angular/router';
import { isEqual } from 'lodash-es';

export class CustomReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<
    string,
    { snapshot: ActivatedRouteSnapshot; handle: DetachedRouteHandle }
  >();
  private readonly cacheLimit = 10;
  private readonly reusableRouters = ['home'];

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getRouteUrl(route);
    if (!!route.routeConfig?.path && this.reusableRouters.includes(url)) {
      return true;
    }
    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const url = this.getRouteUrl(route);
    if (this.storedRoutes.size >= this.cacheLimit) {
      this.storedRoutes.delete(this.storedRoutes.keys().next().value!);
    }
    (handle as any)?.componentRef?.instance?.onDetaching?.();
    this.storedRoutes.set(url, { snapshot: route, handle });
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getRouteUrl(route);
    const stored = this.storedRoutes.get(url);
    return stored ? isEqual(stored.snapshot.params, route.params) : false;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const url = this.getRouteUrl(route);
    const stored = this.storedRoutes.get(url);
    if (stored) {
      this.storedRoutes.delete(url);
      this.storedRoutes.set(url, stored);
      (stored.handle as any)?.componentRef?.instance?.onAttaching?.();
    }
    return stored?.handle ?? null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }

  private getRouteUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map((route) => route.url.map((segment) => segment.path).join('/'))
      .filter((path) => path)
      .join('/');
  }
}
