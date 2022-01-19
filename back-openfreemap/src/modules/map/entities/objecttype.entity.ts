import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GeometryType } from './geometrytype.entity';

@Entity()
export class ObjectType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => GeometryType)
  @JoinColumn()
  geometryType: GeometryType;
}
