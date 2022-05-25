import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveMeritFieldFromCleaner1637092223549 implements MigrationInterface {
    name = 'RemoveMeritFieldFromCleaner1637092223549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cleaner" DROP CONSTRAINT "FK_e618e85ef27e42b611b019ac688"`);
        await queryRunner.query(`ALTER TABLE "cleaner" DROP CONSTRAINT "REL_e618e85ef27e42b611b019ac68"`);
        await queryRunner.query(`ALTER TABLE "cleaner" DROP COLUMN "meritFieldId"`);
        await queryRunner.query(`DROP TABLE "merit_field"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merit_field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "meritTemplateId" character varying NOT NULL, "fieldId" character varying NOT NULL, "fieldName" character varying NOT NULL, "fieldType" character varying NOT NULL, "orgId" character varying NOT NULL, "rawInputValue" character varying NOT NULL, "systemInputValue" character varying NOT NULL, "transformedInputValue" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_4f207f3dc7a4de0f980ae7dbc7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cleaner" ADD "meritFieldId" uuid`);
        await queryRunner.query(`ALTER TABLE "cleaner" ADD CONSTRAINT "REL_e618e85ef27e42b611b019ac68" UNIQUE ("meritFieldId")`);
        await queryRunner.query(`ALTER TABLE "cleaner" ADD CONSTRAINT "FK_e618e85ef27e42b611b019ac688" FOREIGN KEY ("meritFieldId") REFERENCES "merit_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
