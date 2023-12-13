import {
  Column,
  CreateDateColumn,
  Entity, PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserTopicEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  topicId: number;

  @CreateDateColumn()
  createdAt: string;
}
