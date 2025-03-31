export interface PostBuzzRequestDto {
  readonly title: string;
  readonly content: string;
  readonly media?: { type: 'image'; id: string }[];
}
