import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConnectorEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  userMessageId: number;

  @Column()
  isInit: boolean;

  @Column()
  adminMessageId: number;

  @CreateDateColumn()
  createdAt: string;
}
