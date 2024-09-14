import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from 'src/shared/business-errors.interceptor';
import { ProductService } from './product.service';
import { ProductEntity } from './product-entity';
import { ProductDto } from './product-dto';
import { plainToInstance } from 'class-transformer';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductController {

    constructor(private readonly productService: ProductService) { }

    @Get()
    async findAll(): Promise<ProductEntity[]> {
        return await this.productService.findAll();
    }

    @Get(':product_id')
    async findOne(@Param('product_id') productId: string) {
        return await this.productService.findOne(productId);
    }

    @Post()
    async create(@Body() productoDto: ProductDto) {
        const product: ProductEntity = plainToInstance(
            ProductEntity,
            productoDto,
        );
        return await this.productService.create(product);
    }

    @Put(':product_id')
    async update(
        @Param('product_id') productId: string,
        @Body() productoDto: ProductDto,
    ) {
        const product: ProductEntity = plainToInstance(
            ProductEntity,
            productoDto,
        );
        return await this.productService.update(
            productId,
            product,
        );
    }

    @Delete(':product_id')
    @HttpCode(204)
    async delete(@Param('product_id') productId: string) {
        return await this.productService.delete(productId);
    }
}
