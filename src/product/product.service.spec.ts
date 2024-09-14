import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from './product.service';
import { ProductEntity } from './product-entity';
import { faker } from '@faker-js/faker';
import { BusinessLogicException } from 'src/shared/business-errors';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<ProductEntity>;
  let productList: ProductEntity[];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    mockRepository.clear();
    productList = [];
    for (let i = 0; i < 5; i++) {
      const product: ProductEntity = {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        price: faker.number.int({ min: 10, max: 1000 }),
        type: 'Perishable',
        stores: [],
      };
      productList.push(product);
    }
    mockRepository.find.mockReturnValue(productList);
    mockRepository.findOne.mockImplementation((options) =>
      productList.find((product) => product.id === options.where.id),
    );
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products = await service.findAll();
    expect(products).not.toBeNull();
    expect(products).toHaveLength(productList.length);
  });

  it('findOne should return a product by id', async () => {
    const storedProduct = productList[0];
    const product = await service.findOne(storedProduct.id);
    expect(product).not.toBeNull();
    expect(product.name).toEqual(storedProduct.name);
  });

  it('findOne should throw an exception for an invalid product id', async () => {
    mockRepository.findOne.mockReturnValue(null);
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Product with ID 0 not found',
    );
  });

  it('create should return a new product', async () => {
    const productDto = {
      name: faker.commerce.productName(),
      price: faker.number.int({ min: 10, max: 1000 }),
      type: 'Perishable',
      stores: [],
    };
    mockRepository.save.mockReturnValue({
      id: faker.string.uuid(),
      ...productDto,
    });

    const newProduct = await service.create(productDto);
    expect(newProduct).not.toBeNull();
    expect(newProduct.name).toEqual(productDto.name);
  });

  it('create should throw an exception for invalid product type', async () => {
    const productDto = {
      name: faker.commerce.productName(),
      price: faker.number.int({ min: 10, max: 1000 }),
      type: 'InvalidType',
      stores: [],
    };

    await expect(service.create(productDto)).rejects.toHaveProperty(
      'message',
      'Product type must be Perishable or Non-perishable',
    );
  });

  it('update should modify a product', async () => {
    const product = productList[0];
    const updateProductDto = {
      name: 'Updated Product',
      price: product.price,
      type: 'Non-perishable',
      stores: [],
    };
    mockRepository.save.mockReturnValue({
      ...product,
      ...updateProductDto,
    });

    const updatedProduct = await service.update(product.id, updateProductDto);
    expect(updatedProduct).not.toBeNull();
    expect(updatedProduct.name).toEqual('Updated Product');
  });

  it('update should throw an exception for invalid product type', async () => {
    const product = productList[0];
    const updateProductDto = {
      name: 'Updated Product',
      price: product.price,
      type: 'InvalidType',
      stores: [],
    };

    await expect(service.update(product.id, updateProductDto)).rejects.toHaveProperty(
      'message',
      'Product type must be Perishable or Non-perishable',
    );
  });

  it('delete should remove a product', async () => {
    const product = productList[0];
    mockRepository.remove.mockReturnValue(product);

    await service.delete(product.id);
    expect(mockRepository.remove).toHaveBeenCalledWith(product);
  });

  it('delete should throw an exception for an invalid product id', async () => {
    mockRepository.findOne.mockReturnValue(null);

    await expect(service.delete('0')).rejects.toHaveProperty(
      'message',
      'Product with ID 0 not found',
    );
  });
});
