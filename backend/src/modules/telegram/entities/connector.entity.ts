import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Sender {
  USER = 'user',
  ADMIN = 'admin'
}

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
  isTopicStart: boolean;

  @Column({
    enum: Sender,
    type: 'enum'
  })
  sender: Sender;

  @Column()
  adminMessageId: number;

  @CreateDateColumn()
  createdAt: string;
}
