import * as cheerio from 'cheerio';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';
import { markdown } from '@markdown/markdown.helper';

export function MaxPlainTextLength(
  maxLength: number,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxPlainTextLength',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxLength],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const render = markdown.render(value).replace(/\n$/, '');
          const plain = cheerio.load(render).text();
          return plain.length <= maxLength;
        },
        defaultMessage(args: ValidationArguments) {
          return `Plain text length of content must be less than or equal to ${args.constraints[0]} characters.`;
        }
      }
    });
  };
}
