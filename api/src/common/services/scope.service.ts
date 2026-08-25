import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface RequestUser {
  id: string;
  role: UserRole;
  email?: string;
  companyId?: string | null;
}

@Injectable()
export class ScopeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify if a user has authorization to access a specific mine.
   * - ADMIN / REGULATOR: Global access across all mines.
   * - CORPORATE: Access to all mines belonging to their assigned company.
   * - MINE_OFFICIAL: Access to mines explicitly assigned via active UserMineAssignment,
   *   or mines belonging to their assigned company as fallback.
   */
  async canAccessMine(user: RequestUser, mineId: string): Promise<boolean> {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      return true;
    }

    const mine = await this.prisma.mine.findUnique({
      where: { id: mineId },
      include: { company: true },
    });

    if (!mine) {
      return false;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        mineAssignments: {
          where: { active: true },
        },
      },
    });

    if (!dbUser) {
      return false;
    }

    if (user.role === UserRole.CORPORATE) {
      return dbUser.companyId === mine.companyId;
    }

    if (user.role === UserRole.MINE_OFFICIAL) {
      const isDirectlyAssigned = dbUser.mineAssignments.some(
        (a) => a.mineId === mineId,
      );
      if (isDirectlyAssigned) return true;

      // Fallback: If no explicit assignments are created yet, allow company-wide match
      if (dbUser.mineAssignments.length === 0 && dbUser.companyId) {
        return dbUser.companyId === mine.companyId;
      }
      return false;
    }

    return false;
  }

  /**
   * Enforce mine access, throwing ForbiddenException or NotFoundException.
   */
  async assertMineAccess(user: RequestUser, mineId: string): Promise<void> {
    const mine = await this.prisma.mine.findUnique({ where: { id: mineId } });
    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine with id "${mineId}" not found`,
      });
    }

    const hasAccess = await this.canAccessMine(user, mineId);
    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: `Access denied for mine "${mine.name}" (${mineId})`,
      });
    }
  }

  /**
   * Return list of accessible mine IDs for queries, or null if unrestricted.
   */
  async getAccessibleMineIds(user: RequestUser): Promise<string[] | null> {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      return null; // unrestricted
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        mineAssignments: {
          where: { active: true },
        },
      },
    });

    if (!dbUser) {
      return [];
    }

    if (user.role === UserRole.CORPORATE) {
      if (!dbUser.companyId) return [];
      const mines = await this.prisma.mine.findMany({
        where: { companyId: dbUser.companyId },
        select: { id: true },
      });
      return mines.map((m) => m.id);
    }

    if (user.role === UserRole.MINE_OFFICIAL) {
      if (dbUser.mineAssignments.length > 0) {
        return dbUser.mineAssignments.map((a) => a.mineId);
      }
      if (dbUser.companyId) {
        const mines = await this.prisma.mine.findMany({
          where: { companyId: dbUser.companyId },
          select: { id: true },
        });
        return mines.map((m) => m.id);
      }
      return [];
    }

    return [];
  }
}
