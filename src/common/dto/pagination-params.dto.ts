import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  page: number;
}
