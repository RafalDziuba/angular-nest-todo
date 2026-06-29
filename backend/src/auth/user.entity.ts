import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  verificationTokenExpiresAt: Date | null;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'boolean', default: false })
  privacyPolicyAccepted: boolean;

  @Column({ type: 'boolean', default: false })
  newsletterAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
