import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { StoreEntity } from '../store/store-entity';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  type: string;

  @ManyToMany(() => StoreEntity, (store) => store.products)
  @JoinTable()
  stores: StoreEntity[];
}
