import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: false })
  login: string;

  @Column({ type: 'longtext', nullable: false })
  email: string;

  @Column({ type: 'longtext', nullable: true })
  avatar?: string;

  @Column({ type: 'longtext', nullable: false })
  passwordHash?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
