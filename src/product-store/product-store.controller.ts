import { Controller, Post, Get, Param, Delete, Put, Body } from '@nestjs/common';
import { ProductStoreService } from './product-store.service';
import { StoreEntity } from 'src/store/store-entity';

@Controller('products')
export class ProductStoreController {

    constructor(private readonly productStoreService: ProductStoreService) { }

    @Post(':product_id/stores/:store_id')
    async addStoreToProduct(
        @Param('product_id') productId: string,
        @Param('store_id') storeId: string,
    ): Promise<void> {
        return this.productStoreService.addStoreToProduct(productId, storeId);
    }

    @Get(':product_id/stores')
    async findStoresFromProduct(@Param('product_id') productId: string): Promise<StoreEntity[]> {
        return this.productStoreService.findStoresFromProduct(productId);
    }

    @Get(':product_id/stores/:store_id')
    async findStoreFromProduct(
        @Param('product_id') productId: string,
        @Param('store_id') storeId: string,
    ): Promise<StoreEntity> {
        return this.productStoreService.findStoreFromProduct(productId, storeId);
    }

    @Put(':product_id/stores')
    async updateStoresFromProduct(
        @Param('product_id') productId: string,
        @Body('store_Ids') storeIds: string[],
    ): Promise<void> {
        return this.productStoreService.updateStoresFromProduct(productId, storeIds);
    }

    @Delete(':product_id/stores/:store_id')
    async deleteStoreFromProduct(
        @Param('product_id') productId: string,
        @Param('store_id') storeId: string,
    ): Promise<void> {
        return this.productStoreService.deleteStoreFromProduct(productId, storeId);
    }
}
