import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { MinioModule } from '../minio/minio.module';
import { ImageCacheModule } from '../image-cache/image-cache.module';

@Module({
  imports: [MinioModule, ImageCacheModule],
  controllers: [ImagesController],
})
export class ImagesModule {}
