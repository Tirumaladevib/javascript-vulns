import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateMappingPK1634523939970 implements MigrationInterface {
    name = 'UpdateMappingPK1634523939970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mapping" DROP CONSTRAINT "PK_63215a5148ef25e4bd227cd1bdf"`);
        await queryRunner.query(`ALTER TABLE "mapping" ADD CONSTRAINT "PK_58b86948f34b055dd1c044c2396" PRIMARY KEY ("cleanerId", "inputValue")`);
        await queryRunner.query(`ALTER TABLE "mapping" ADD CONSTRAINT "UQ_63215a5148ef25e4bd227cd1bdf" UNIQUE ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mapping" DROP CONSTRAINT "UQ_63215a5148ef25e4bd227cd1bdf"`);
        await queryRunner.query(`ALTER TABLE "mapping" DROP CONSTRAINT "PK_58b86948f34b055dd1c044c2396"`);
        await queryRunner.query(`ALTER TABLE "mapping" ADD CONSTRAINT "PK_63215a5148ef25e4bd227cd1bdf" PRIMARY KEY ("id")`);
    }

}
