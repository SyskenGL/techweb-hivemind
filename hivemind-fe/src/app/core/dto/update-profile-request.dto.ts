export interface UpdateProfileRequestDto {
  readonly fullName?: string;
  readonly birthdate?: string;
  readonly bio?: string;
  readonly propicId?: string | null;
  readonly coverId?: string | null;
  readonly websiteUrl?: string | null;
  readonly twitterUrl?: string | null;
  readonly linkedInUrl?: string | null;
  readonly facebookUrl?: string | null;
  readonly instagramUrl?: string | null;
}
