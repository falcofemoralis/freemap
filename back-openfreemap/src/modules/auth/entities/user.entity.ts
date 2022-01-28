import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  avatar?: string;

  constructor(login: string, email: string, passwordHash: string) {
    this.login = login;
    this.email = email;
    this.passwordHash = passwordHash;
  }
}
