import { WorkspaceUserRole } from '@prisma/client';

export interface WorkspaceUserI {
  userId: number;
  role: WorkspaceUserRole;
  email: string;
  username: string;
}
