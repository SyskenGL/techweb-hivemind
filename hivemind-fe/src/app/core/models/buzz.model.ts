import { Author } from './author.model';
import { BuzzMetric } from './metric.model';
import { BuzzInteraction } from './interaction.model';

export interface Buzz {
  readonly id: string;
  readonly author: Author;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly media: { type: 'image'; id: string }[];
  readonly metric: BuzzMetric;
  readonly interaction: BuzzInteraction;
}
