import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000; // precision to meters
}

/**
 * 2D Ray-Casting Point-in-Polygon check.
 * Polygon ring is array of [longitude, latitude] coordinates.
 */
export function isPointInPolygonRing(point: GeoPoint, ring: number[][]): boolean {
  let inside = false;
  const x = point.longitude;
  const y = point.latitude;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

@Injectable()
export class GisService {
  private readonly logger = new Logger(GisService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Validates coordinate inputs.
   */
  validateCoordinate(lat: number, lng: number) {
    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Latitude must be a valid number between -90 and 90',
      });
    }
    if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Longitude must be a valid number between -180 and 180',
      });
    }
  }

  /**
   * Extract representative centroid coordinate from a mine's geoBoundary or location string.
   */
  getMineCentroid(mine: any): GeoPoint {
    const b = mine.geoBoundary;
    if (b) {
      // 1. Standard GeoJSON Polygon
      if (b.type === 'Polygon' && Array.isArray(b.coordinates?.[0])) {
        const ring = b.coordinates[0];
        let sumLng = 0;
        let sumLat = 0;
        ring.forEach((coord: number[]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        return {
          latitude: Math.round((sumLat / ring.length) * 100000) / 100000,
          longitude: Math.round((sumLng / ring.length) * 100000) / 100000,
        };
      }
      // 2. Standard GeoJSON Feature containing Polygon
      if (b.type === 'Feature' && b.geometry?.type === 'Polygon' && Array.isArray(b.geometry.coordinates?.[0])) {
        const ring = b.geometry.coordinates[0];
        let sumLng = 0;
        let sumLat = 0;
        ring.forEach((coord: number[]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        return {
          latitude: Math.round((sumLat / ring.length) * 100000) / 100000,
          longitude: Math.round((sumLng / ring.length) * 100000) / 100000,
        };
      }
      // 3. Legacy circle { lat, lng, radius_km }
      if (typeof b.lat === 'number' && typeof b.lng === 'number') {
        return { latitude: b.lat, longitude: b.lng };
      }
    }

    // Default fallbacks based on known coal basins
    if (mine.location?.includes('Dhanbad') || mine.code?.includes('JHA')) {
      return { latitude: 23.7507, longitude: 86.4158 };
    }
    if (mine.location?.includes('Korba') || mine.code?.includes('KRB')) {
      return { latitude: 22.3595, longitude: 82.7501 };
    }
    if (mine.location?.includes('Raniganj') || mine.code?.includes('RNG')) {
      return { latitude: 23.6135, longitude: 87.1246 };
    }
    if (mine.location?.includes('Singrauli') || mine.code?.includes('SNG')) {
      return { latitude: 24.0996, longitude: 82.6751 };
    }
    return { latitude: 23.0, longitude: 85.0 };
  }

  /**
   * Evaluates whether a point lies inside a mine's statutory boundary.
   * Returns boolean if a boundary is present, or null if no boundary is configured.
   */
  isPointInsideMineBoundary(point: GeoPoint, mine: any): boolean | null {
    const b = mine.geoBoundary;
    if (!b) return null;

    // 1. GeoJSON Polygon
    if (b.type === 'Polygon' && Array.isArray(b.coordinates)) {
      const outerRing = b.coordinates[0];
      if (!Array.isArray(outerRing) || outerRing.length < 3) return null;
      const inOuter = isPointInPolygonRing(point, outerRing);
      if (!inOuter) return false;

      // Check inner holes
      for (let h = 1; h < b.coordinates.length; h++) {
        if (isPointInPolygonRing(point, b.coordinates[h])) {
          return false; // inside hole -> outside polygon
        }
      }
      return true;
    }

    // 2. GeoJSON Feature
    if (b.type === 'Feature' && b.geometry?.type === 'Polygon' && Array.isArray(b.geometry.coordinates)) {
      const outerRing = b.geometry.coordinates[0];
      if (!Array.isArray(outerRing) || outerRing.length < 3) return null;
      return isPointInPolygonRing(point, outerRing);
    }

    // 3. GeoJSON MultiPolygon
    if (b.type === 'MultiPolygon' && Array.isArray(b.coordinates)) {
      for (const poly of b.coordinates) {
        if (Array.isArray(poly) && Array.isArray(poly[0])) {
          if (isPointInPolygonRing(point, poly[0])) return true;
        }
      }
      return false;
    }

    // 4. Legacy circular boundary { lat, lng, radius_km }
    if (typeof b.lat === 'number' && typeof b.lng === 'number' && typeof b.radius_km === 'number') {
      const dist = calculateHaversineDistance(point.latitude, point.longitude, b.lat, b.lng);
      return dist <= b.radius_km;
    }

    return null;
  }

  /**
   * Find nearby mines within a radius, enforcing user authorization scope.
   */
  async findNearbyMines(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 10,
    user: RequestUser,
  ) {
    this.validateCoordinate(latitude, longitude);
    const clampedRadius = Math.min(Math.max(Number(radiusKm) || 50, 0.1), 500); // max 500km
    const clampedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50); // max 50

    const where: any = { status: 'ACTIVE' };
    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      where.id = { in: accessibleMineIds || [] };
    }

    const mines = await this.prisma.mine.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, code: true } },
      },
    });

    const results = mines
      .map((mine) => {
        const centroid = this.getMineCentroid(mine);
        const distanceKm = calculateHaversineDistance(
          latitude,
          longitude,
          centroid.latitude,
          centroid.longitude,
        );
        return {
          id: mine.id,
          name: mine.name,
          code: mine.code,
          company: mine.company,
          location: mine.location,
          representativeCoordinate: centroid,
          distanceKm,
        };
      })
      .filter((m) => m.distanceKm <= clampedRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, clampedLimit);

    return {
      query: {
        latitude,
        longitude,
        radiusKm: clampedRadius,
        limit: clampedLimit,
      },
      totalFound: results.length,
      data: results,
    };
  }

  /**
   * Get location context for a specific mine and coordinate.
   */
  async getLocationContext(
    mineId: string,
    latitude: number,
    longitude: number,
    user: RequestUser,
  ) {
    this.validateCoordinate(latitude, longitude);

    const mine = await this.prisma.mine.findUnique({
      where: { id: mineId },
      include: {
        company: { select: { id: true, name: true, code: true } },
      },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine with id "${mineId}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, mineId);

    const point: GeoPoint = { latitude, longitude };
    const centroid = this.getMineCentroid(mine);
    const distanceKm = calculateHaversineDistance(
      latitude,
      longitude,
      centroid.latitude,
      centroid.longitude,
    );
    const insideBoundary = this.isPointInsideMineBoundary(point, mine);

    return {
      mine: {
        id: mine.id,
        name: mine.name,
        code: mine.code,
        company: mine.company,
      },
      point,
      representativeCoordinate: centroid,
      distanceKm,
      insideBoundary,
      limitations:
        'Point-in-polygon containment evaluated using 2D ray-casting over statutory WGS84 GeoJSON mine boundaries. Distance calculated via Haversine great-circle formula.',
    };
  }
}
