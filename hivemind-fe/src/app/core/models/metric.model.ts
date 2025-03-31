export interface UserMetric {
  readonly followers: number;
  readonly followings: number;
  readonly buzzes: number;
}

export interface BuzzMetric {
  readonly comments: number;
  readonly views: number;
  readonly votes: { up: number; down: number };
}

export interface CommentMetric {
  readonly replies: number;
  readonly votes: { up: number; down: number };
}
