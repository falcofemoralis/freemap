import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('geometrytypes')
export class GeometryType {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  geometry: string;
}
