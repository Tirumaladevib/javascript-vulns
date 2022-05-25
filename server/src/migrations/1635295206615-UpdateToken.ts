import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateToken1635295206615 implements MigrationInterface {
    name = 'UpdateToken1635295206615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "PK_82fae97f905930df5d62a702fc9"`);
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "PK_e73852cd0f68da588c779775a85" PRIMARY KEY ("orgId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "PK_e73852cd0f68da588c779775a85"`);
        await queryRunner.query(`ALTER TABLE "token" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id")`);
    }

}
