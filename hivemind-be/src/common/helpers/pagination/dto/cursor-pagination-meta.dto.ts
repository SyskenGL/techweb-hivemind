import { ApiProperty } from '@nestjs/swagger';

export class CursorPaginationMetaDto {
  @ApiProperty({
    description:
      'A string rappresenting the cursor used to fetch the next page of results.',
    example:
      'LTI3Ojo2Njo6Mzk6OjAxOTRlODcwLWI5YzEtNzQ3Yi05MzdkLTgyNTkxNzVjY2Y0MA',
    nullable: true
  })
  cursor: string | null;
}
