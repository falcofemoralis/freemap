import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext' })
  login: string;

  @Column({ type: 'longtext' })
  password?: string;
}
