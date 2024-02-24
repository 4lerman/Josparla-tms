import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddOrRemoveMemberDto {
  @IsNotEmpty()
  @IsNumber()
  workspaceId: number;

  @IsNotEmpty()
  @IsNumber()
  memberId: number;
}
