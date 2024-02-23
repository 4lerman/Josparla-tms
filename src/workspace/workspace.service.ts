import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedWorkspaces } from './models/paginated-workspace.type';
import { Workspace, WorkspaceUserRole } from '@prisma/client';
import { UserRole } from 'src/common/models/role.enum';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllWorkspaces(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });
    let workspaces: Workspace[];
    let totalCount: number;

    if (UserRole.ADMIN == user.role) {
      workspaces = await this.prismaService.workspace.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          workspaceUser: true,
        },
      });
      totalCount = workspaces.length;
    } else {
      workspaces = await this.findWorkspacesByUserId(userId, page, limit);
      totalCount = await this.prismaService.workspace.count({
        where: {
          workspaceUser: {
            some: {
              userId,
            },
          },
        },
      });
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      data: workspaces,
      hasMore,
      totalPages,
      currentPages: page,
    };
  }

  async findWorkspacesByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<Workspace[]> {
    const workspaceUsers = await this.prismaService.workspaceUser.findMany({
      where: {
        userId,
      },
      include: {
        workspace: true,
        user: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return workspaceUsers.map((workspaceUsers) => workspaceUsers.workspace);
  }

  async getWorkspacesCreatedByUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedWorkspaces> {
    return await this.getWorkspacesByRoles(userId, page, limit, [
      WorkspaceUserRole.OWNER,
    ]);
  }

  async getWorkspacesWhereMember(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedWorkspaces> {
    return await this.getWorkspacesByRoles(userId, page, limit, [
      WorkspaceUserRole.MEMBER,
      WorkspaceUserRole.ADMIN,
    ]);
  }

  async getWorkspacesByRoles(
    userId: number,
    page: number,
    limit: number,
    roles: WorkspaceUserRole[],
  ): Promise<PaginatedWorkspaces> {
    const workspaceUsers = await this.prismaService.workspaceUser.findMany({
      where: {
        userId,
        role: { in: roles },
      },
      include: {
        workspace: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!workspaceUsers) throw new NotFoundException('No such user!');

    const workspaces = workspaceUsers.map(
      (workspaceUsers) => workspaceUsers.workspace,
    );

    const totalCount = workspaces.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      data: workspaces,
      hasMore,
      totalPages,
      currentPages: page,
    };
  }

  async createWorkspace(
    userId: number,
    dto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.prismaService.workspace.create({
      data: {
        ...dto,
        workspaceUser: {
          create: {
            userId,
            role: 'OWNER', // Assuming 'role' is a field in the WorkspaceUser model
          },
        },
      },
    });

    return workspace;
  }

  async updateWorkspace(
    userId: number,
    workspaceId: number,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const workspaceUser = await this.prismaService.workspaceUser.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!workspaceUser || workspaceUser.role !== WorkspaceUserRole.OWNER)
      throw new UnauthorizedException('Only owners can make changes');

    const workspace = await this.prismaService.workspace.update({
      where: {
        id: workspaceUser.workspaceId,
      },
      data: {
        ...dto,
      },
    });

    return workspace;
  }

  async deleteWorkspace(userId: number, workspaceId: number): Promise<void> {
    const workspaceUser = await this.prismaService.workspaceUser.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!workspaceUser || workspaceUser.role !== WorkspaceUserRole.OWNER)
      throw new UnauthorizedException('Only owners can make changes');

    await this.prismaService.workspace.delete({
      where: {
        id: workspaceUser.workspaceId,
      },
    });
  }
}
