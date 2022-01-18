import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectSubtype } from './objectsubtype.entity';
import { ObjectType } from './objectype.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class MapObject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

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

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
