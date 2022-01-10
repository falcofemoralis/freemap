import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ObjectSubtype } from './objectsubtype.entity';
import { ObjectType } from './objectype.entity';

@Entity()
export class MapData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  coordinates: string;

  @ManyToOne(() => ObjectType)
  @JoinColumn()
  type: ObjectType;

  @ManyToOne(() => ObjectSubtype)
  @JoinColumn()
  subtype: ObjectSubtype;
}
