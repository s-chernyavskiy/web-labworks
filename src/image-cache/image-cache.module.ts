import { Global, Module } from '@nestjs/common';
import { ImageCacheService } from './image-cache.service';

@Global()
@Module({
  providers: [ImageCacheService],
  exports: [ImageCacheService],
})
export class ImageCacheModule {}
