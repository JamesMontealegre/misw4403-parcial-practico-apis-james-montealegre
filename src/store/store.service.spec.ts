import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreService } from './store.service';
import { StoreEntity } from './store-entity';
import { faker } from '@faker-js/faker';
import { BusinessError, BusinessLogicException } from 'src/shared/business-errors';

describe('StoreService', () => {
  let service: StoreService;
  let repository: Repository<StoreEntity>;
  let storeList: StoreEntity[];

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
        StoreService,
        {
          provide: getRepositoryToken(StoreEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    repository = module.get<Repository<StoreEntity>>(getRepositoryToken(StoreEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    mockRepository.clear();
    storeList = [];
    for (let i = 0; i < 5; i++) {
      const store: StoreEntity = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        city: faker.location.city().substring(0, 3), // Generate a 3-character city code
        address: faker.location.streetAddress(),
        products: [],
      };
      storeList.push(store);
    }
    mockRepository.find.mockReturnValue(storeList);
    mockRepository.findOne.mockImplementation((options) =>
      storeList.find((store) => store.id === options.where.id),
    );
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all stores', async () => {
    const stores = await service.findAll();
    expect(stores).not.toBeNull();
    expect(stores).toHaveLength(storeList.length);
  });

  it('findOne should return a store by id', async () => {
    const storedStore = storeList[0];
    const store = await service.findOne(storedStore.id);
    expect(store).not.toBeNull();
    expect(store.name).toEqual(storedStore.name);
  });

  it('findOne should throw an exception for an invalid store id', async () => {
    mockRepository.findOne.mockReturnValue(null);
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Store with ID 0 not found',
    );
  });

  it('create should return a new store', async () => {
    const storeDto = {
      name: faker.company.name(),
      city: faker.location.city().substring(0, 3), // Valid 3-character city code
      address: faker.location.streetAddress(),
      products: [],
    };

    mockRepository.create.mockReturnValue(storeDto);
    mockRepository.save.mockReturnValue({
      id: faker.string.uuid(),
      ...storeDto,
    });

    const newStore = await service.create(storeDto);
    expect(newStore).not.toBeNull();
    expect(newStore.name).toEqual(storeDto.name);
  });

  it('create should throw an exception for an invalid city code', async () => {
    const storeDto = {
      name: faker.company.name(),
      city: 'InvalidCityCode',
      address: faker.location.streetAddress(),
      products: [],
    };

    await expect(service.create(storeDto)).rejects.toHaveProperty(
      'message',
      'City code must be exactly 3 characters',
    );
  });

  it('update should modify a store', async () => {
    const store = storeList[0];
    const updateStoreDto = {
      name: 'Updated Store',
      city: store.city,
      address: store.address,
      products: store.products,
    };

    mockRepository.save.mockReturnValue({
      ...store,
      ...updateStoreDto,
    });

    const updatedStore = await service.update(store.id, updateStoreDto);
    expect(updatedStore).not.toBeNull();
    expect(updatedStore.name).toEqual('Updated Store');
  });

  it('update should throw an exception for an invalid city code', async () => {
    const store = storeList[0];
    const updateStoreDto = {
      name: 'Updated Store',
      city: 'InvalidCityCode',
      address: store.address,
      products: store.products,
    };

    await expect(service.update(store.id, updateStoreDto)).rejects.toHaveProperty(
      'message',
      'City code must be exactly 3 characters',
    );
  });

  it('delete should remove a store', async () => {
    const store = storeList[0];
    mockRepository.remove.mockReturnValue(store);

    await service.delete(store.id);
    expect(mockRepository.remove).toHaveBeenCalledWith(store);
  });

  it('delete should throw an exception for an invalid store id', async () => {
    mockRepository.findOne.mockReturnValue(null);

    await expect(service.delete('0')).rejects.toHaveProperty(
      'message',
      'Store with ID 0 not found',
    );
  });
});
