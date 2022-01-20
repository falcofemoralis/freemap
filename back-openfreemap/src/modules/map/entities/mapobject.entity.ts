import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType } from './objecttype.entity';
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

  @Column()
  zoom: number;

  @ManyToOne(() => ObjectType)
  @JoinColumn()
  type: ObjectType;

  @Column({ type: 'longtext', nullable: true })
  address: string | null;

  @Column({ type: 'longtext', nullable: true })
  links: string | null;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
