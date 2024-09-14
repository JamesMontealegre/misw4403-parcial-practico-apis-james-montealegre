import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product/product-entity';
import { StoreEntity } from '../store/store-entity';
import { ProductStoreService } from './product-store.service';
import { BusinessLogicException } from '../shared/business-errors';
import { faker } from '@faker-js/faker';

describe('ProductStoreService', () => {
  let service: ProductStoreService;
  let productRepository: Repository<ProductEntity>;
  let storeRepository: Repository<StoreEntity>;
  let product: ProductEntity;
  let storeList: StoreEntity[];

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockStoreRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductStoreService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(StoreEntity),
          useValue: mockStoreRepository,
        },
      ],
    }).compile();

    service = module.get<ProductStoreService>(ProductStoreService);
    productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    storeRepository = module.get<Repository<StoreEntity>>(getRepositoryToken(StoreEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    product = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: faker.number.float({ min: 100, max: 1000 }),
      type: 'Perishable',
      stores: [],
    };

    storeList = [];
    for (let i = 0; i < 5; i++) {
      const store: StoreEntity = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        city: faker.location.city().substring(0, 3),
        address: faker.location.streetAddress(),
        products: [],
      };
      storeList.push(store);
    }

    product.stores = storeList;
    mockProductRepository.findOne.mockResolvedValue(product);
    mockStoreRepository.findOne.mockImplementation((options) =>
      storeList.find((store) => store.id === options.where.id),
    );
  };

  it('addStoreToProduct should add a store to a product', async () => {
    const newStore: StoreEntity = {
      id: faker.string.uuid(),
      name: faker.company.name(),
      city: faker.location.city().substring(0, 3),
      address: faker.location.streetAddress(),
      products: [],
    };

    mockStoreRepository.findOne.mockResolvedValueOnce(newStore);
    mockProductRepository.save.mockResolvedValueOnce({ ...product, stores: [...product.stores, newStore] });

    await service.addStoreToProduct(product.id, newStore.id);
    expect(mockProductRepository.save).toHaveBeenCalled();
    expect(product.stores.length).toBe(6);
    expect(product.stores).toContain(newStore);
  });

  it('addStoreToProduct should throw an error if product is not found', async () => {
    mockProductRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.addStoreToProduct('invalidProductId', storeList[0].id)).rejects.toHaveProperty(
      'message',
      'Product not found',
    );
  });

  it('addStoreToProduct should throw an error if store is not found', async () => {
    mockStoreRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.addStoreToProduct(product.id, 'invalidStoreId')).rejects.toHaveProperty(
      'message',
      'Store not found',
    );
  });

  it('findStoresFromProduct should return the stores associated with a product', async () => {
    const stores = await service.findStoresFromProduct(product.id);
    expect(stores).toHaveLength(5);
    expect(stores).toEqual(storeList);
  });

  it('findStoresFromProduct should throw an error if product is not found', async () => {
    mockProductRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findStoresFromProduct('invalidProductId')).rejects.toHaveProperty(
      'message',
      'Product not found',
    );
  });

  it('findStoreFromProduct should return a specific store associated with a product', async () => {
    const store = await service.findStoreFromProduct(product.id, storeList[0].id);
    expect(store).toEqual(storeList[0]);
  });

  it('findStoreFromProduct should throw an error if store is not found', async () => {
    await expect(service.findStoreFromProduct(product.id, 'invalidStoreId')).rejects.toHaveProperty(
      'message',
      'Store not found',
    );
  });

  it('updateStoresFromProduct should update the list of stores associated with a product', async () => {
    const updatedStores = [storeList[1], storeList[2]];
    mockStoreRepository.find.mockResolvedValueOnce(updatedStores);

    await service.updateStoresFromProduct(product.id, [storeList[1].id, storeList[2].id]);
    expect(product.stores).toEqual(updatedStores);
    expect(mockProductRepository.save).toHaveBeenCalled();
  });

  it('updateStoresFromProduct should throw an error if product is not found', async () => {
    mockProductRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.updateStoresFromProduct('invalidProductId', [storeList[0].id])).rejects.toHaveProperty(
      'message',
      'Product not found',
    );
  });

  it('deleteStoreFromProduct should remove a store from a product', async () => {
    await service.deleteStoreFromProduct(product.id, storeList[0].id);

    expect(product.stores.length).toBe(4);
    expect(product.stores).not.toContain(storeList[0]);
    expect(mockProductRepository.save).toHaveBeenCalled();
  });

  it('deleteStoreFromProduct should throw an error if product is not found', async () => {
    mockProductRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.deleteStoreFromProduct('invalidProductId', storeList[0].id)).rejects.toHaveProperty(
      'message',
      'Product not found',
    );
  });
});
