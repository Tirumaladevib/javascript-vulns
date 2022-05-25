import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateJobLogTable1635843572410 implements MigrationInterface {
    name = 'CreateJobLogTable1635843572410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "job_log" ("id" character varying NOT NULL, "meritId" character varying NOT NULL, "newFieldValue" jsonb NOT NULL, "oldFieldValue" jsonb NOT NULL, "meta" jsonb NOT NULL, CONSTRAINT "PK_7fae985f584950ab07d2f7a5712" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "job_log"`);
    }

}
