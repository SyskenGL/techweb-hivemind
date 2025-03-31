import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

export function IsValidAge(
  min: number,
  max: number,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidAge',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          if (value instanceof Date) {
            const timeDifference = new Date().getTime() - value.getTime();
            const age = Math.floor(
              timeDifference / (1000 * 3600 * 24 * 365.25)
            );
            return age >= min && age <= max;
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not valid, age should be in [${min}, ${max}]`;
        }
      }
    });
  };
}
