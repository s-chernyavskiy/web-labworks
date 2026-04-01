import { BadRequestException } from '@nestjs/common';

export function requireActorUserId(raw: string | string[] | undefined): number {
  const value =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;

  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new BadRequestException('Missing user-id header');
  }

  return parsed;
}
