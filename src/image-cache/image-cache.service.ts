import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class ImageCacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');
    this.redis = url ? new Redis(url) : new Redis();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async getUrl(cacheKey: string): Promise<string | null> {
    return await this.redis.get(cacheKey);
  }

  async setUrl(
    cacheKey: string,
    url: string,
    ttlSeconds: number,
  ): Promise<void> {
    const ttl = Math.max(1, Math.floor(ttlSeconds));
    await this.redis.set(cacheKey, url, 'EX', ttl);
  }
}
