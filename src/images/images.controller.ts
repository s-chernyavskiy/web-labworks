import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ImageCacheService } from '../image-cache/image-cache.service';
import { MinioService } from '../minio/minio.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly minioService: MinioService,
    private readonly imageCacheService: ImageCacheService,
  ) {}

  @Get(':key/url')
  @ApiParam({ name: 'key', example: 'boards/1/cover.png' })
  @ApiQuery({
    name: 'ttl',
    required: false,
    description: 'Signed URL TTL in seconds',
    example: 300,
  })
  async getImageUrl(
    @Param('key') key: string,
    @Query('ttl') ttlRaw?: string,
  ): Promise<{ url: string; expiresInSeconds: number; cached: boolean }> {
    const ttl = ttlRaw ? Number.parseInt(ttlRaw, 10) : undefined;
    const ttlSeconds =
      typeof ttl === 'number' && Number.isFinite(ttl) && ttl > 0
        ? ttl
        : undefined;

    const effectiveTtl = ttlSeconds ?? this.minioService.getDefaultTtlSeconds();
    const cacheKey = `img:url:${key}:ttl:${effectiveTtl}`;

    const cachedUrl = await this.imageCacheService.getUrl(cacheKey);
    if (cachedUrl) {
      return { url: cachedUrl, expiresInSeconds: effectiveTtl, cached: true };
    }

    const signed = await this.minioService.getPresignedGetUrl({
      key,
      expiresInSeconds: effectiveTtl,
    });

    await this.imageCacheService.setUrl(
      cacheKey,
      signed.url,
      signed.expiresInSeconds,
    );
    return {
      url: signed.url,
      expiresInSeconds: signed.expiresInSeconds,
      cached: false,
    };
  }
}
