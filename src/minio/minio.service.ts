import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
    const signingEndpoint =
      this.configService.get<string>('MINIO_SIGNED_URL_ENDPOINT') ?? endpoint;
    const accessKeyId =
      this.configService.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretAccessKey =
      this.configService.getOrThrow<string>('MINIO_SECRET_KEY');
    const region =
      this.configService.get<string>('MINIO_REGION') ?? 'us-east-1';

    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.client = new S3Client({
      region,
      endpoint: signingEndpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  getDefaultTtlSeconds(): number {
    const ttl = this.configService.get<number>('MINIO_SIGNED_URL_TTL_SECONDS');
    return typeof ttl === 'number' && Number.isFinite(ttl) && ttl > 0
      ? ttl
      : 300;
  }

  async getPresignedGetUrl(params: {
    key: string;
    expiresInSeconds?: number;
  }): Promise<{ url: string; expiresInSeconds: number }> {
    const expiresInSeconds =
      params.expiresInSeconds ?? this.getDefaultTtlSeconds();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
    return { url, expiresInSeconds };
  }

  async getPresignedPutUrl(params: {
    key: string;
    contentType?: string;
    expiresInSeconds?: number;
  }): Promise<{ url: string; expiresInSeconds: number }> {
    const expiresInSeconds =
      params.expiresInSeconds ?? this.getDefaultTtlSeconds();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
    return { url, expiresInSeconds };
  }
}
