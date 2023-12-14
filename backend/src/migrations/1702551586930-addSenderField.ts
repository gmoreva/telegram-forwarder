import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSenderField1702551586930 implements MigrationInterface {
  name = 'AddSenderField1702551586930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "connector_entity_sender_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(`ALTER TABLE "connector_entity"
        ADD "sender" "connector_entity_sender_enum" NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "connector_entity"
        DROP COLUMN "sender"`);
    await queryRunner.query(`DROP TYPE "connector_entity_sender_enum"`);
  }

}
