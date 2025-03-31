export interface Profile {
  readonly fullName: string;
  readonly birthdate: string;
  readonly bio: string | null;
  readonly propicId: string | null;
  readonly coverId: string | null;
  readonly websiteUrl: string | null;
  readonly twitterUrl: string | null;
  readonly linkedInUrl: string | null;
  readonly facebookUrl: string | null;
  readonly instagramUrl: string | null;
  readonly updatedAt: string | null;
}
