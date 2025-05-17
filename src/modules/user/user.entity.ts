import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ unique: true })
  phone: string;

  @Column({ select: false })
  password: string;
}
