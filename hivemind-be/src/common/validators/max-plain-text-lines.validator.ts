import * as cheerio from 'cheerio';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';
import { markdown } from '@markdown/markdown.helper';

export function MaxPlainTextLines(
  maxLines: number,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxPlainTextLines',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxLines],
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const render = markdown.render(value).replace(/\n$/, '');
          const plain = cheerio.load(render).text();
          const lineCount = plain.split('\n').length;
          return lineCount <= maxLines;
        },
        defaultMessage(args: ValidationArguments) {
          return `Plain text must not exceed ${args.constraints[0]} lines.`;
        }
      }
    });
  };
}
