import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GeometryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  geometry: string;
}
