import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product-entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/business-errors';
import { ProductDto } from './product-dto';

@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) { }

    async findAll(): Promise<ProductEntity[]> {
        return await this.productRepository.find({ relations: ['stores'] });
    }


    async findOne(id: string): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({ where: { id }, relations: ['stores'] });
        if (!product) {
            throw new BusinessLogicException(`Product with ID ${id} not found`, BusinessError.NOT_FOUND);
        }
        return product;
    }

    async create(createProductDto: ProductDto): Promise<ProductEntity> {
        const { type } = createProductDto;

        if (type !== 'Perishable' && type !== 'Non-perishable') {
            throw new BusinessLogicException('Product type must be Perishable or Non-perishable', BusinessError.BAD_REQUEST);
        }

        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async update(id: string, updateProductDto: ProductDto): Promise<ProductEntity> {
        const product = await this.findOne(id);
        const { type } = updateProductDto;

        if (type && type !== 'Perishable' && type !== 'Non-perishable') {
            throw new BusinessLogicException('Product type must be Perishable or Non-perishable', BusinessError.BAD_REQUEST);
        }

        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async delete(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }
}
