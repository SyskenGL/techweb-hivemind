import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class GenericValidators {
  static notOnlyWhitespaceOrNewline(
    control: AbstractControl
  ): ValidationErrors | null {
    return control.value.replace(/\s/g, '').length > 0
      ? null
      : { onlyWhitespaceOrNewline: true };
  }

  static propertyValidator(
    validate: (value: any) => boolean,
    errorKey: string = 'property'
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!validate(value)) {
        return { [errorKey]: true };
      }
      return null;
    };
  }

  static isUrl(prefix?: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      let value = control.value;
      if (value) {
        value = prefix ? prefix + value : value;
        const urlPattern =
          /^(https?:\/\/)?([\w\d-]+\.)+[\w-]{2,}([\/\w\d\-_.~]*)?$/;
        if (value && !urlPattern.test(value)) {
          return { url: true };
        }
      }
      return null;
    };
  }
}
