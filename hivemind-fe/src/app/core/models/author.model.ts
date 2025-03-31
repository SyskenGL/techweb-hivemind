import { UserRelation } from './relation.model';

export interface Author {
  readonly id: string;
  readonly username: string;
  readonly fullName: string;
  readonly verified: boolean;
  readonly propicId: string | null;
  readonly relation?: UserRelation;
}
