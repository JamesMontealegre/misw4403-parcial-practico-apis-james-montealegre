import { Controller, Post, Get, Put, Delete, HttpCode, Param, Body } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreEntity } from './store-entity';
import { plainToInstance } from 'class-transformer';
import { StoreDto } from './store-dto';

@Controller('store')
export class StoreController {

    constructor(private readonly storeService: StoreService) { }

    @Get()
    async findAll(): Promise<StoreEntity[]> {
        return await this.storeService.findAll();
    }

    @Get(':store_id')
    async findOne(@Param('store_id') storeId: string) {
        return await this.storeService.findOne(storeId);
    }

    @Post()
    async create(@Body() storeDto: StoreDto) {
        const store: StoreEntity = plainToInstance(
            StoreEntity,
            storeDto,
        );
        return await this.storeService.create(store);
    }

    @Put(':store_id')
    async update(
        @Param('store_id') storeId: string,
        @Body() storeDto: StoreDto,
    ) {
        const store: StoreEntity = plainToInstance(
            StoreEntity,
            storeDto,
        );
        return await this.storeService.update(
            storeId,
            store,
        );
    }

    @Delete(':store_id')
    @HttpCode(204)
    async delete(@Param('store_id') storeId: string) {
        return await this.storeService.delete(storeId);
    }
}
