import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1702472608710 implements MigrationInterface {
  name = 'Test1702472608710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "connector_entity"
                             (
                                 "id"             SERIAL    NOT NULL,
                                 "userId"         integer   NOT NULL,
                                 "userMessageId"  integer   NOT NULL,
                                 "isInit"         boolean   NOT NULL,
                                 "isTopicStart"   boolean   NOT NULL,
                                 "adminMessageId" integer   NOT NULL,
                                 "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_27d4482aa61c9afb34bb0f6ab93" PRIMARY KEY ("id")
                             )`);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "connector_entity"`);
  }
}
