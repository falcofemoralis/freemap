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
export class MapObject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext' })
  name: string;

  @Column({ type: 'longtext' })
  desc: string;

  @Column({ type: 'longtext' })
  coordinates: string;

  @ManyToOne(() => ObjectType)
  @JoinColumn()
  type: ObjectType;

  @ManyToOne(() => ObjectSubtype)
  @JoinColumn()
  subtype: ObjectSubtype;

  @Column({ type: 'longtext', nullable: true })
  address: string | null;

  @Column({ type: 'longtext', nullable: true })
  links: string | null;
}
