import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './store-entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])],
  controllers: [StoreController],
  providers: [StoreService]
})
export class StoreModule { }
