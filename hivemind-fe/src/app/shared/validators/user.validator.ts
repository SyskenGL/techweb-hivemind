import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { catchError, debounceTime, first, map, of, switchMap, tap } from 'rxjs';
import { UserService } from '@core/services';

export class UserValidators {
  static PASSWORD_POLICY = {
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUpperCase: 1,
    minLowerCase: 1
  };

  static age(control: AbstractControl): ValidationErrors | null {
    const timestamp = Date.parse(control.value);
    if (isNaN(timestamp)) {
      return null;
    }
    const timeDifference = new Date().getTime() - new Date(timestamp).getTime();
    const age = Math.floor(timeDifference / (1000 * 3600 * 24 * 365.25));
    if (age < 0) {
      return { age: 'traveler' };
    }
    if (age < 18) {
      return { age: 'underage' };
    }
    if (age > 120) {
      return { age: 'overage' };
    }
    return null;
  }

  static fullName(control: AbstractControl): ValidationErrors | null {
    const validator = Validators.compose([
      Validators.maxLength(70),
      Validators.pattern(/^[\p{L}](?:[-.']?\s?[\p{L}])*$/u)
    ])!;
    return validator(control) ? { fullName: true } : null;
  }

  static username(control: AbstractControl): ValidationErrors | null {
    const validator = Validators.compose([
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[a-zA-Z0-9])(?!.*[._]{2})[a-zA-Z0-9._]+$/)
    ])!;
    return validator(control) ? { username: true } : null;
  }

  static usernameAvailable(userService: UserService): AsyncValidatorFn {
    return UserValidators.usernameOrEmailAvailable(userService);
  }

  static usernameOrEmail(control: AbstractControl): ValidationErrors | null {
    if (UserValidators.username(control)) {
      return Validators.email(control) ? { usernameOrEmail: true } : null;
    }
    return null;
  }

  static emailAvailable(userService: UserService): AsyncValidatorFn {
    return UserValidators.usernameOrEmailAvailable(userService);
  }

  static password(control: AbstractControl): ValidationErrors | null {
    const errors = [];
    const password = control.value;
    if (password.length < UserValidators.PASSWORD_POLICY.minLength) {
      errors.push('length');
    }
    if (
      UserValidators.PASSWORD_POLICY.minUpperCase === 1 &&
      UserValidators.PASSWORD_POLICY.minLowerCase === 1 &&
      (!/[A-Z]/.test(password) || !/[a-z]/.test(password))
    ) {
      errors.push('letter');
    } else {
      if (
        (password.match(/[A-Z]/g) || []).length <
        UserValidators.PASSWORD_POLICY.minUpperCase
      ) {
        errors.push('uppercase');
      }
      if (
        (password.match(/[a-z]/g) || []).length <
        UserValidators.PASSWORD_POLICY.minLowerCase
      ) {
        errors.push('lowercase');
      }
    }
    if (
      (password.match(/\d/g) || []).length <
      UserValidators.PASSWORD_POLICY.minNumbers
    ) {
      errors.push('number');
    }
    if (
      (password.match(/[^a-zA-Z0-9]/g) || []).length <
      UserValidators.PASSWORD_POLICY.minSymbols
    ) {
      errors.push('symbol');
    }
    return errors.length > 0 ? { password: errors } : null;
  }

  private static usernameOrEmailAvailable(
    userService: UserService
  ): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges.pipe(
        tap(() => control.setErrors({ ...control.errors, pending: true })),
        debounceTime(500),
        switchMap((value) =>
          userService
            .isUsernameOrEmailAvailable(value)
            .pipe(catchError(() => of(void 0)))
        ),
        map((available) => {
          if (available === undefined) {
            return { unverified: true };
          }
          return available ? null : { unavailable: true };
        }),
        first()
      );
    };
  }
}
