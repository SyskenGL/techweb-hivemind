import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { MediaService, UserService } from '@core/services';
import {
  FigureCoverComponent,
  FigurePropicComponent
} from '@shared/components';
import { GenericValidators, UserValidators } from '@shared/validators';

@Component({
  selector: 'hm-modal-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FigureCoverComponent,
    FigurePropicComponent,
    ReactiveFormsModule
  ],
  templateUrl: './modal-edit-profile.component.html'
})
export class ModalEditProfileComponent {
  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;

  updateProfileForm!: FormGroup;
  submitting: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly toastrService: ToastrService
  ) {
    this.initializeUpdateProfileForm();
  }

  get coverId(): FormControl<string> {
    return this.updateProfileForm.get('coverId')! as FormControl<string>;
  }

  get propicId(): FormControl<string> {
    return this.updateProfileForm.get('propicId')! as FormControl<string>;
  }

  get fullName(): FormControl<string> {
    return this.updateProfileForm.get('fullName')! as FormControl<string>;
  }

  get fullNameError(): string | null {
    const control = this.fullName;
    if (control.invalid && control.touched) {
      if (control.hasError('required')) {
        return 'Full name is required';
      }
      if (control.hasError('fullName')) {
        return 'Enter a valid full name';
      }
    }
    return null;
  }

  get birthdate(): FormControl<string> {
    return this.updateProfileForm.get('birthdate')! as FormControl<string>;
  }

  get birthdateError(): string | null {
    const control = this.birthdate;
    if (control.invalid && control.touched) {
      if (control.hasError('required')) {
        return 'Birthdate is required';
      }
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

  get bio(): FormControl<string> {
    return this.updateProfileForm.get('bio')! as FormControl<string>;
  }

  get websiteUrl(): FormControl<string> {
    return this.updateProfileForm.get('websiteUrl')! as FormControl<string>;
  }

  get twitterUrl(): FormControl<string> {
    return this.updateProfileForm.get('twitterUrl')! as FormControl<string>;
  }

  get linkedInUrl(): FormControl<string> {
    return this.updateProfileForm.get('linkedInUrl')! as FormControl<string>;
  }

  get facebookUrl(): FormControl<string> {
    return this.updateProfileForm.get('facebookUrl')! as FormControl<string>;
  }

  get instagramUrl(): FormControl<string> {
    return this.updateProfileForm.get('instagramUrl')! as FormControl<string>;
  }

  onSave(): void {
    this.userService
      .updateProfile({
        propicId: this.propicId.dirty ? this.propicId.value : undefined,
        coverId: this.coverId.dirty ? this.coverId.value : undefined,
        fullName: this.fullName.dirty ? this.fullName.value : undefined,
        birthdate: this.birthdate.dirty ? this.birthdate.value : undefined,
        bio: this.bio.dirty
          ? this.bio.value.replace(/(\r\n|\r|\n)+/g, '\n')
          : undefined,
        websiteUrl: this.websiteUrl.dirty
          ? this.websiteUrl.value
            ? 'https://' + this.websiteUrl.value
            : null
          : undefined,
        twitterUrl: this.twitterUrl.dirty
          ? this.twitterUrl.value
            ? 'https://x.com/' + this.twitterUrl.value
            : null
          : undefined,
        instagramUrl: this.instagramUrl.dirty
          ? this.instagramUrl.value
            ? 'https://instagram.com/' + this.instagramUrl.value
            : null
          : undefined,
        facebookUrl: this.facebookUrl.dirty
          ? this.facebookUrl.value
            ? 'https://facebook.com/' + this.facebookUrl.value
            : null
          : undefined,
        linkedInUrl: this.linkedInUrl.dirty
          ? this.linkedInUrl.value
            ? 'https://linkedin.com/in/' + this.linkedInUrl.value
            : null
          : undefined
      })
      .subscribe({
        next: () => {
          this.close();
          this.toastrService.info(
            'Your profile has been updated.',
            'Profile Updated'
          );
        },
        error: () =>
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Profile Updated Failed'
          )
      });
  }

  getUrlError(control: FormControl<string>): string | null {
    if (control.invalid && control.touched) {
      if (control.hasError('url')) {
        return 'Enter a valid URL';
      }
    }
    return null;
  }

  onFileSelect(event: Event, type: 'cover' | 'propic'): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      const file = input.files[0];
      const control = type === 'cover' ? this.coverId : this.propicId;
      const previousValue = control.value;
      control.setValue(undefined as any);
      control.markAsDirty();
      this.mediaService.uploadImage(file).subscribe({
        next: (id) => control.patchValue(id),
        error: () => {
          control.setValue(previousValue);
          this.toastrService.error(
            'Whoops! Something went wrong. Try again later.',
            'Image Upload Failed'
          );
        }
      });
    }
  }

  removeImage(type: 'cover' | 'propic'): void {
    const control = type === 'cover' ? this.coverId : this.propicId;
    control.setValue(null as any);
    control.markAsDirty();
  }

  initializeUpdateProfileForm(): void {
    const currentUser = this.userService.currentUser!;
    this.updateProfileForm = this.formBuilder.group({
      coverId: [
        currentUser.profile.coverId,
        [GenericValidators.propertyValidator((value) => value !== undefined)]
      ],
      propicId: [
        currentUser.profile.propicId,
        [GenericValidators.propertyValidator((value) => value !== undefined)]
      ],
      fullName: [
        currentUser.profile.fullName,
        [Validators.required, UserValidators.fullName]
      ],
      birthdate: [
        format(new Date(currentUser.profile.birthdate), 'yyyy-MM-dd'),
        [Validators.required, UserValidators.age]
      ],
      bio: [currentUser.profile.bio, [Validators.maxLength(300)]],
      websiteUrl: [
        currentUser.profile.websiteUrl?.replace('https://', ''),
        [GenericValidators.isUrl('https://')]
      ],
      linkedInUrl: [
        currentUser.profile.linkedInUrl?.replace(
          'https://linkedin.com/in/',
          ''
        ),
        [GenericValidators.isUrl('https://linkedin.com/in/')]
      ],
      twitterUrl: [
        currentUser.profile.twitterUrl?.replace('https://x.com/', ''),
        [GenericValidators.isUrl('https://x.com/')]
      ],
      facebookUrl: [
        currentUser.profile.facebookUrl?.replace('https://facebook.com/', ''),
        [GenericValidators.isUrl('https://facebook.com/')]
      ],
      instagramUrl: [
        currentUser.profile.instagramUrl?.replace('https://instagram.com/', ''),
        [GenericValidators.isUrl('https://instagram.com/')]
      ]
    });
  }

  open(): void {
    this.modal.nativeElement.showModal();
  }

  close(): void {
    this.modal.nativeElement.close();
    this.initializeUpdateProfileForm();
  }
}
