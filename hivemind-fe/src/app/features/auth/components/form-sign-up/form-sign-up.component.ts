import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserService } from '@core/services';
import { finalize } from 'rxjs';
import { fadeInOutAnimation } from '@shared/animations';
import { UserValidators } from '@shared/validators';

@Component({
  selector: 'hm-form-sign-up',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './form-sign-up.component.html',
  animations: [fadeInOutAnimation()]
})
export class FormSignUpComponent {
  signUpForm: FormGroup;
  signUpError?: string;
  signingUp: boolean = false;
  passwordRules: string[] = [];
  showPassword: boolean = false;
  showPasswordRules: boolean = false;

  constructor(
    formBuilder: FormBuilder,
    userService: UserService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.signUpForm = formBuilder.group({
      fullName: ['', [Validators.required, UserValidators.fullName]],
      birthdate: ['', [Validators.required, UserValidators.age]],
      email: [
        '',
        [Validators.required, Validators.email],
        [UserValidators.emailAvailable(userService)]
      ],
      username: [
        '',
        [Validators.required, UserValidators.username],
        [UserValidators.usernameAvailable(userService)]
      ],
      password: ['', [Validators.required, UserValidators.password]],
      tos: [false, Validators.requiredTrue]
    });
    this.setPasswordRules();
    this.email.markAsTouched();
    this.username.markAsTouched();
  }

  get fullName(): FormControl<string> {
    return this.signUpForm.get('fullName')! as FormControl<string>;
  }

  get fullNameError(): string | null {
    const control = this.fullName;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('fullName')) {
        return 'Enter a valid full name';
      }
    }
    return null;
  }

  get birthdate(): FormControl<string> {
    return this.signUpForm.get('birthdate')! as FormControl<string>;
  }

  get birthdateError(): string | null {
    const control = this.birthdate;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('age')) {
        switch (control.getError('age')) {
          case 'traveler':
            return "Marty, the DeLorean's broken!";
          case 'overage':
            return "Looks like you're a bit too experienced!";
          case 'underage':
            return 'A minimum age of 18 is required';
          default:
            return null;
        }
      }
    }
    return null;
  }

  get email(): FormControl<string> {
    return this.signUpForm.get('email')! as FormControl<string>;
  }

  get emailError(): string | null {
    const control = this.email;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('email')) {
        return `Enter a valid e-mail address`;
      }
      if (control.hasError('unverified')) {
        return `Sorry! We are having trouble verifying your e-mail right now. Please try again later.`;
      }
      if (control.hasError('unavailable')) {
        return `This e-mail is already in use. Please try another.`;
      }
    }
    return null;
  }

  get username(): FormControl<string> {
    return this.signUpForm.get('username')! as FormControl<string>;
  }

  get usernameError(): string | null {
    const control = this.username;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('username')) {
        return `Enter a valid username`;
      }
      if (control.hasError('unverified')) {
        return `Sorry! We are having trouble verifying your username right now. Please try again later.`;
      }
      if (control.hasError('unavailable')) {
        return `This username is already taken. Please try another.`;
      }
    }
    return null;
  }

  get password(): FormControl<string> {
    return this.signUpForm.get('password')! as FormControl<string>;
  }

  get passwordError(): string | null {
    const control = this.password;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('password')) {
        return `Password is too weak`;
      }
    }
    return null;
  }

  onSignUp(): void {
    this.signingUp = true;
    this.authService
      .signUp({
        fullName: this.fullName.value,
        birthdate: this.birthdate.value,
        email: this.email.value,
        username: this.username.value,
        password: this.password.value
      })
      .pipe(finalize(() => (this.signingUp = false)))
      .subscribe({
        complete: () => this.router.navigateByUrl('/home'),
        error: () =>
          (this.signUpError =
            'Whoops! Something went wrong.\n Please try again later.')
      });
  }

  private setPasswordRules(): void {
    const getPasswordRules = () =>
      this.password.hasError('password')
        ? this.password.getError('password').map((error: string) => {
            switch (error) {
              case 'length':
                return 'Contains at least 8 characters';
              case 'number':
                return 'Contains at least one number';
              case 'symbol':
                return 'Contains at least one special character';
              case 'letter':
                return 'Contains both upper and lower case letters';
              default:
                return null;
            }
          })
        : [];
    this.passwordRules = getPasswordRules();
    this.password.valueChanges.subscribe(
      () => (this.passwordRules = getPasswordRules())
    );
  }
}
