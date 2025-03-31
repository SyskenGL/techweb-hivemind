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
import { finalize } from 'rxjs';
import { AuthService } from '@core/services';
import { UserValidators } from '@shared/validators';

@Component({
  selector: 'hm-form-sign-in',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './form-sign-in.component.html'
})
export class FormSignInComponent {
  signInForm: FormGroup;
  signInError?: string;
  signingIn: boolean = false;
  showPassword: boolean = false;

  constructor(
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.signInForm = formBuilder.group({
      usernameOrEmail: [
        '',
        [Validators.required, UserValidators.usernameOrEmail]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(UserValidators.PASSWORD_POLICY.minLength)
        ]
      ],
      rememberMe: [false]
    });
  }

  get usernameOrEmail(): FormControl<string> {
    return this.signInForm.get('usernameOrEmail')! as FormControl<string>;
  }

  get usernameOrEmailError(): string | null {
    const control = this.usernameOrEmail;
    if (control.invalid && control.touched && !control.hasError('required')) {
      if (control.hasError('usernameOrEmail')) {
        return 'Enter a valid username or e-mail address';
      }
    }
    return null;
  }

  get password(): FormControl<string> {
    return this.signInForm.get('password')! as FormControl<string>;
  }

  get rememberMe(): FormControl<boolean> {
    return this.signInForm.get('rememberMe')! as FormControl<boolean>;
  }

  onSignIn(): void {
    this.signingIn = true;
    this.authService
      .signIn(
        {
          usernameOrEmail: this.usernameOrEmail.value,
          password: this.password.value
        },
        this.rememberMe.value
      )
      .pipe(finalize(() => (this.signingIn = false)))
      .subscribe({
        complete: () => this.router.navigateByUrl('/home'),
        error: (error) =>
          (this.signInError =
            error?.error?.code === 'hm-auth-e001'
              ? 'The username or password you provided is incorrect. Please double-check and try again.'
              : 'Whoops! Something went wrong.\n Please try again later.')
      });
  }
}
