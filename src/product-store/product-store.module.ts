import { Module } from '@nestjs/common';
import { ProductStoreService } from './product-store.service';
import { ProductStoreController } from './product-store.controller';

@Module({
  providers: [ProductStoreService],
  controllers: [ProductStoreController]
})
export class ProductStoreModule {}
