import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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

  @Post(':key/upload-url')
  @ApiParam({ name: 'key', example: 'boards/1/cover.png' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contentType: { type: 'string', example: 'image/png' },
        ttl: { type: 'number', example: 300 },
      },
      required: [],
    },
  })
  async getUploadUrl(
    @Param('key') key: string,
    @Body('contentType') contentType?: string,
    @Body('ttl') ttlRaw?: number,
  ): Promise<{ url: string; expiresInSeconds: number }> {
    const ttlSeconds =
      typeof ttlRaw === 'number' && Number.isFinite(ttlRaw) && ttlRaw > 0
        ? ttlRaw
        : undefined;

    return await this.minioService.getPresignedPutUrl({
      key,
      contentType,
      expiresInSeconds: ttlSeconds,
    });
  }
}
