import { BuzzCriterion } from '@core/enums';

export interface BuzzCriterionQueryDto {
  criterion: BuzzCriterion;
  values?: string[];
}
