import { Author } from './author.model';
import { CommentInteraction } from './interaction.model';
import { CommentMetric } from './metric.model';

export interface Comment {
  readonly id: string;
  readonly buzzId: string;
  readonly parentCommentId: string | null;
  readonly author: Author;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly metric: CommentMetric;
  readonly interaction: CommentInteraction;
}
