import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../product/product-entity';
import { In, Repository } from 'typeorm';
import { StoreEntity } from '../store/store-entity';
import { BusinessError, BusinessLogicException } from '../shared/business-errors';

@Injectable()
export class ProductStoreService {

    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(StoreEntity)
        private readonly storeRepository: Repository<StoreEntity>,
    ) { }

    async addStoreToProduct(productId: string, storeId: string): Promise<void> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['stores'],
        });
        const store = await this.storeRepository.findOne({ where: { id: storeId } });

        if (!product) {
            throw new BusinessLogicException('Product not found', BusinessError.NOT_FOUND);
        }

        if (!store) {
            throw new BusinessLogicException('Store not found', BusinessError.NOT_FOUND);
        }

        product.stores.push(store);
        await this.productRepository.save(product);
    }

    async findStoresFromProduct(productId: string): Promise<StoreEntity[]> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['stores'],
        });
        if (!product) {
            throw new BusinessLogicException('Product not found', BusinessError.NOT_FOUND);
        }
        return product.stores;
    }

    async findStoreFromProduct(productId: string, storeId: string): Promise<StoreEntity> {
        const stores = await this.findStoresFromProduct(productId);
        const store = stores.find((store) => store.id === storeId);
        if (!store) {
            throw new BusinessLogicException('Store not found', BusinessError.NOT_FOUND);
        }
        return store;
    }

    async updateStoresFromProduct(productId: string, storeIds: string[]): Promise<void> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['stores'],
        });

        if (!product) {
            throw new BusinessLogicException('Product not found', BusinessError.NOT_FOUND);
        }

        const stores = await this.storeRepository.find({
            where: { id: In(storeIds) },
        });

        if (!stores || stores.length === 0) {
            throw new BusinessLogicException('Product or Stores not found', BusinessError.NOT_FOUND);
        }

        product.stores = stores;
        await this.productRepository.save(product);
    }

    async deleteStoreFromProduct(productId: string, storeId: string): Promise<void> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['stores'],
        });

        if (!product) {
            throw new BusinessLogicException('Product not found', BusinessError.NOT_FOUND);
        }

        product.stores = product.stores.filter((store) => store.id !== storeId);
        await this.productRepository.save(product);
    }

}
