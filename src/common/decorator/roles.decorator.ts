import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../models/role.enum';

export const Roles = (...roles: UserRole[]): any => SetMetadata('roles', roles);
