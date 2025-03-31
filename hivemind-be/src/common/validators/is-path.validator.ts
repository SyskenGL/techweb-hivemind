import * as path from 'path';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

export function IsPath(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPath',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: string, args: ValidationArguments) {
          return typeof value === 'string' && path.isAbsolute(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} must be an absolute path.`;
        }
      }
    });
  };
}
