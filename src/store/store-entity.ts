import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Product } from '../product/product-entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @ManyToMany(() => Product, (product) => product.stores)
  products: Product[];
}
