import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConnectorEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  userId: number;
  @Column()
  messageId: number;

  @CreateDateColumn()
  createdAt: string;
}
