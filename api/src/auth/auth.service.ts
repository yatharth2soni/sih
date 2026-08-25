import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Hash a plaintext password with bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('bcrypt.saltRounds') || 10;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Verify a plaintext password against a bcrypt hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * SHA-256 hash of a raw refresh token (for DB storage).
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generate a cryptographically random refresh token.
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Login: validate credentials, issue access + refresh tokens.
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const passwordValid = await this.verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Account is not active. Contact your administrator.',
      });
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const rawRefreshToken = this.generateRefreshToken();

    // Store sha256 hash of refresh token
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt,
      },
    });

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      data: {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  /**
   * Refresh: validate refresh token, rotate tokens.
   */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }

    if (storedToken.revoked) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Refresh token has been revoked',
      });
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Refresh token has expired',
      });
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new tokens
    const newAccessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.role,
    );
    const newRawRefreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    await this.prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: this.hashToken(newRawRefreshToken),
        expiresAt: this.calculateExpiry(refreshExpiresIn),
      },
    });

    return {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRawRefreshToken,
      },
    };
  }

  /**
   * Logout: revoke refresh token.
   */
  async logout(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken && !storedToken.revoked) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
    }

    return {
      data: {
        message: 'Logged out successfully',
      },
    };
  }

  private generateAccessToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, role },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn') || '15m',
      },
    );
  }

  /**
   * Parse duration strings like "7d", "15m", "1h" to a Date in the future.
   */
  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Default to 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
