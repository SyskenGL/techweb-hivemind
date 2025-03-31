import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CursorPaginationMetaDto } from '../dto';

export const ApiPaginatedCursor = <TModel extends Type<any>>(options: {
  model: TModel;
  description?: string;
}) => {
  const paginatedModel = {
    title: `${options.model}Paginated`,
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(options.model) }
      },
      pagination: {
        type: 'object',
        $ref: getSchemaPath(CursorPaginationMetaDto)
      }
    }
  };
  return applyDecorators(
    ApiExtraModels(options.model, CursorPaginationMetaDto),
    ApiOkResponse({
      schema: paginatedModel,
      description: options.description
    })
  );
};
