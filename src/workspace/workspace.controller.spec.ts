import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationParamsDto } from '../common/dto/pagination-params.dto';
import { PaginatedWorkspaces } from './models/paginated-workspace.type';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Workspace } from '@prisma/client';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

describe('Workspace Controller', () => {
  let controller: WorkspaceController;
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            getAllWorkspaces: jest.fn(),
            findWorkspacesByUserId: jest.fn(),
            getWorkspacesCreatedByUser: jest.fn(),
            getWorkspacesByRoles: jest.fn(),
            getWorkspacesWhereMember: jest.fn(),
            createWorkspace: jest.fn(),
            updateWorkspace: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
            workspace: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            workspaceUser: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllWorkspaces', () => {
    it('should return all workspaces for admin user', async () => {
      const userId = 1;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest.spyOn(service, 'getAllWorkspaces').mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });

      const result: PaginatedWorkspaces = await controller.getAllWorkspaces(
        userId,
        query,
      );

      expect(result).toEqual({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });
    });

    it('should return all workspaces for regular user', async () => {
      const userId = 2;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest.spyOn(service, 'getAllWorkspaces').mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });

      const result: PaginatedWorkspaces = await controller.getAllWorkspaces(
        userId,
        query,
      );

      expect(result).toEqual({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });
    });
  });

  describe('getMyWorkspaces', () => {
    it('should list workspaces created by user', async () => {
      const userId = 1;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest.spyOn(service, 'getWorkspacesCreatedByUser').mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });

      const result: PaginatedWorkspaces = await controller.getMyWorkspaces(
        userId,
        query,
      );

      expect(result).toEqual({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 2;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest
        .spyOn(service, 'getWorkspacesCreatedByUser')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.getMyWorkspaces(userId, query)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWorkspacesWhereMember', () => {
    it('should list workspaces where user is member', async () => {
      const userId = 1;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest.spyOn(service, 'getWorkspacesWhereMember').mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });

      const result: PaginatedWorkspaces =
        await controller.getWorkspacesWhereMember(userId, query);

      expect(result).toEqual({
        data: [],
        hasMore: false,
        totalPages: 1,
        currentPages: 1,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 2;
      const query: PaginationParamsDto = { page: 1, limit: 10 };

      jest
        .spyOn(service, 'getWorkspacesWhereMember')
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.getWorkspacesWhereMember(userId, query),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createWorkspace', () => {
    it('should create and return workspace', async () => {
      const userId = 1;
      const dto: CreateWorkspaceDto = {
        name: 'test',
        description: 'testing description',
      };
      const createdWorkspace: Workspace = {
        id: 1,
        name: 'test',
        description: 'testing description',
        createdAt: new Date(),
      };

      jest
        .spyOn(service, 'createWorkspace')
        .mockResolvedValueOnce(createdWorkspace);

      const result = await controller.createWorkspace(userId, dto);

      expect(result).toEqual(createdWorkspace);
    });
  });

  describe('updateWorkspace', () => {
    it('should return updated workspace', async () => {
      const userId = 1;
      const workspaceId = 1;
      const dto: UpdateWorkspaceDto = {
        name: 'test',
        description: 'test description',
      };

      const updatedWorkspace: Workspace = {
        id: 1,
        name: 'test',
        description: 'test description',
        createdAt: new Date(),
      };

      jest
        .spyOn(service, 'updateWorkspace')
        .mockResolvedValueOnce(updatedWorkspace);

      const result = await controller.updateWorkspace(workspaceId, userId, dto);

      expect(result).toEqual(updatedWorkspace);
    });

    it('should throw UnauthorizedException if user is not owner or not found', async () => {
      const userId = 1;
      const workpaceId = 1;
      const dto: UpdateWorkspaceDto = {
        name: 'test',
        description: 'test description',
      };

      jest
        .spyOn(service, 'updateWorkspace')
        .mockRejectedValueOnce(new UnauthorizedException());

      await expect(
        controller.updateWorkspace(workpaceId, userId, dto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
