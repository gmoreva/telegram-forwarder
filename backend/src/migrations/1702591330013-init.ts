import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1702591330013 implements MigrationInterface {
  name = 'Init1702591330013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."connector_entity_sender_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(`CREATE TABLE "connector_entity"
                             (
                                 "id"             SERIAL                                  NOT NULL,
                                 "userId"         integer                                 NOT NULL,
                                 "userMessageId"  integer                                 NOT NULL,
                                 "isInit"         boolean                                 NOT NULL,
                                 "isTopicStart"   boolean                                 NOT NULL,
                                 "sender"         "public"."connector_entity_sender_enum" NOT NULL,
                                 "adminMessageId" integer                                 NOT NULL,
                                 "createdAt"      TIMESTAMP                               NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_27d4482aa61c9afb34bb0f6ab93" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "connector_entity"`);
    await queryRunner.query(
      `DROP TYPE "public"."connector_entity_sender_enum"`,
    );
  }
}
