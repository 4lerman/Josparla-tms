import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { WorkspaceService } from './workspace.service';
import { PaginationParamsDto } from '../common/dto/pagination-params.dto';
import { Roles } from '../common/decorator/roles.decorator';
import { UserRole } from '../common/models/role.enum';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { PaginatedWorkspaces } from './models/paginated-workspace.type';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from '@prisma/client';
import { AddOrRemoveMemberDto } from './dto/add-or-remove-member.dto';

@UseGuards(JwtGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(RoleGuard)
  @Get()
  getAllWorkspaces(
    @GetUser('id') userId: number,
    @Query() query: PaginationParamsDto,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getAllWorkspaces(
      userId,
      query.page,
      query.limit,
    );
  }

  @Get('me')
  getMyWorkspaces(
    @GetUser('id') userId: number,
    @Query() query: PaginationParamsDto,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesCreatedByUser(
      userId,
      query.page,
      query.limit,
    );
  }

  @Get('member')
  getWorkspacesWhereMember(
    @GetUser('id') userId: number,
    @Query() query: PaginationParamsDto,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesWhereMember(
      userId,
      query.page,
      query.limit,
    );
  }

  @Post()
  createWorkspace(
    @GetUser('id') userId: number,
    @Body() dto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    return this.workspaceService.createWorkspace(userId, dto);
  }

  @Patch(':id')
  updateWorkspace(
    @Param('id') workspaceId: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(userId, workspaceId, dto);
  }

  @Delete(':id')
  deleteWorkspace(
    @Param('id') workspaceId: number,
    @GetUser('id') userId: number,
  ): Promise<void> {
    return this.workspaceService.deleteWorkspace(userId, workspaceId);
  }

  @Get(':workspaceId/members')
  getWorkspaceMembers(@Param('workspaceId') workspaceId: number) {
    return this.workspaceService.getWorkspaceMembers(workspaceId);
  }

  @Post('add-member')
  addMemberToWorkspace(
    @GetUser('id') userId: number,
    @Body() dto: AddOrRemoveMemberDto,
  ): Promise<{ memberId: number; msg: string }> {
    return this.workspaceService.addMemberToWorkspace(userId, dto);
  }

  @Patch('remove-member')
  removeMemberFromWorkspace(
    @GetUser('id') userId: number,
    @Body() dto: AddOrRemoveMemberDto,
  ): Promise<void> {
    return this.workspaceService.removeMemberFromWorkspace(userId, dto);
  }
}
