import { PATH_METADATA } from '@nestjs/common/constants';

export function buildHandlerPath(
  baseUrl: string,
  targetController: object,
  targetMethod: object,
  params: Record<string, string>
): string {
  baseUrl = baseUrl.replace(/^\/+|\/+$/g, '');
  let controllerPath: string = Reflect.getMetadata(
    PATH_METADATA,
    targetController
  );
  controllerPath = controllerPath.replace(/^\/+|\/+$/g, '');
  let methodPath: string = Reflect.getMetadata(PATH_METADATA, targetMethod);
  methodPath = methodPath.replace(/^\/+|\/+$/g, '');
  methodPath = methodPath.replace(/:([a-zA-Z]+)/g, (_, name) => {
    return params[name] ?? `:${name}`;
  });
  return [baseUrl, controllerPath, methodPath].filter((path) => path).join('/');
}
