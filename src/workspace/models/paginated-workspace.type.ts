import { Workspace } from '@prisma/client';
import { PaginatedResponse } from '../../common/models/paginated-response.interface';

export type PaginatedWorkspaces = PaginatedResponse<Workspace>;
