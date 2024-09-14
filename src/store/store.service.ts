import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './store-entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/business-errors';
import { StoreDto } from './store-dto';

@Injectable()
export class StoreService {

    constructor(
        @InjectRepository(StoreEntity)
        private readonly storeRepository: Repository<StoreEntity>,
    ) { }

    async findAll(): Promise<StoreEntity[]> {
        return await this.storeRepository.find({ relations: ['products'] });
    }

    async findOne(id: string): Promise<StoreEntity> {
        const store = await this.storeRepository.findOne({ where: { id }, relations: ['products'] });
        if (!store) {
            throw new BusinessLogicException(`Store with ID ${id} not found`, BusinessError.NOT_FOUND);
        }
        return store;
    }

    async create(createStoreDto: StoreDto): Promise<StoreEntity> {
        const { city } = createStoreDto;

        if (city.length !== 3) {
            throw new BusinessLogicException('City code must be exactly 3 characters', BusinessError.BAD_REQUEST);
        }

        const store = this.storeRepository.create(createStoreDto);
        return await this.storeRepository.save(store);
    }

    async update(id: string, updateStoreDto: StoreDto): Promise<StoreEntity> {
        const store = await this.findOne(id);
        const { city } = updateStoreDto;

        if (city && city.length !== 3) {
            throw new BusinessLogicException('City code must be exactly 3 characters', BusinessError.BAD_REQUEST);
        }

        Object.assign(store, updateStoreDto);
        return await this.storeRepository.save(store);
    }

    async delete(id: string): Promise<void> {
        const store = await this.findOne(id);
        await this.storeRepository.remove(store);
    }
}
