import { UserMetric } from './metric.model';
import { Profile } from './profile.model';
import { UserRelation } from './relation.model';

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email?: string;
  readonly verified: boolean;
  readonly createdAt: string;
  readonly profile: Profile;
  readonly metric: UserMetric;
  readonly relation?: UserRelation;
}
