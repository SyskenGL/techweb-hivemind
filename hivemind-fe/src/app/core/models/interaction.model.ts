export interface BuzzInteraction {
  readonly vote: 'up' | 'down' | null;
  readonly comments: number;
  readonly authored: boolean;
  readonly bookmarked: boolean;
}

export interface CommentInteraction {
  readonly vote: 'up' | 'down' | null;
  readonly authored: boolean;
  readonly replied: boolean;
}
