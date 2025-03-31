export class CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly secret: string;
  readonly fullName: string;
  readonly birthdate: Date;
}
