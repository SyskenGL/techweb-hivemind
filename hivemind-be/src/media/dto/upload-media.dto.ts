import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Media to be uploaded.',
    type: 'string',
    format: 'binary',
    required: true
  })
  readonly media: Express.Multer.File;
}
