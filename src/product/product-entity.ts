import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Store } from '../store/store-entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  type: string;

  @ManyToMany(() => Store, (store) => store.products)
  @JoinTable()
  stores: Store[];
}
