import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1633940368290 implements MigrationInterface {
    name = 'initial1633940368290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merit_field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "meritTemplateId" character varying NOT NULL, "fieldId" character varying NOT NULL, "fieldName" character varying NOT NULL, "fieldType" character varying NOT NULL, "orgId" character varying NOT NULL, "rawInputValue" character varying NOT NULL, "systemInputValue" character varying NOT NULL, "transformedInputValue" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_4f207f3dc7a4de0f980ae7dbc7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_addba60dfc3d1830fd9beae17c" ON "merit_field" ("meritTemplateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b16a5e04f01650d6b5e11a82a4" ON "merit_field" ("fieldId") `);
        await queryRunner.query(`CREATE TABLE "cleaner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "meritTemplates" jsonb NOT NULL, "fieldId" character varying NOT NULL, "fieldName" character varying NOT NULL, "fieldType" character varying NOT NULL, "orgId" character varying NOT NULL, "active" boolean NOT NULL, "meritFieldId" uuid, CONSTRAINT "REL_e618e85ef27e42b611b019ac68" UNIQUE ("meritFieldId"), CONSTRAINT "PK_ad0b112c3140ea51a4a491c54df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "type" character varying NOT NULL, "orgId" character varying NOT NULL, "cleanerId" character varying NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_d8ccd9b5b44828ea378dd37e691" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fetcher_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orgId" character varying NOT NULL, "cleanerIds" text NOT NULL, CONSTRAINT "PK_274fadddb0963689519e9bf6121" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fetcher_state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "meritTemplateId" character varying, "type" character varying NOT NULL, "orgId" character varying NOT NULL, "retries" integer NOT NULL, "lastCursor" character varying, CONSTRAINT "PK_04aa38835481acf39027213403d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mapping" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cleanerId" character varying NOT NULL, "inputValue" character varying NOT NULL, "outputValue" character varying, "meritFieldId" uuid, CONSTRAINT "PK_63215a5148ef25e4bd227cd1bdf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "process_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "meritId" character varying NOT NULL, "fetcherRunId" character varying NOT NULL, "fieldId" character varying NOT NULL, "orgId" character varying NOT NULL, "oldValue" character varying NOT NULL, "newValue" character varying NOT NULL, "cleanerId" uuid, CONSTRAINT "REL_2afb3255bc02a23ac028e33269" UNIQUE ("cleanerId"), CONSTRAINT "PK_467b954659eddd23f1249b959fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orgId" character varying NOT NULL, "orgAccessToken" character varying NOT NULL, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e73852cd0f68da588c779775a8" ON "token" ("orgId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "meritMemberId" character varying NOT NULL, "orgId" character varying, "orgTitle" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cleaner" ADD CONSTRAINT "FK_e618e85ef27e42b611b019ac688" FOREIGN KEY ("meritFieldId") REFERENCES "merit_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mapping" ADD CONSTRAINT "FK_58def2c2e8f199e0f597a27f281" FOREIGN KEY ("meritFieldId") REFERENCES "cleaner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "process_log" ADD CONSTRAINT "FK_2afb3255bc02a23ac028e33269c" FOREIGN KEY ("cleanerId") REFERENCES "cleaner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "process_log" DROP CONSTRAINT "FK_2afb3255bc02a23ac028e33269c"`);
        await queryRunner.query(`ALTER TABLE "mapping" DROP CONSTRAINT "FK_58def2c2e8f199e0f597a27f281"`);
        await queryRunner.query(`ALTER TABLE "cleaner" DROP CONSTRAINT "FK_e618e85ef27e42b611b019ac688"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "IDX_e73852cd0f68da588c779775a8"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "process_log"`);
        await queryRunner.query(`DROP TABLE "mapping"`);
        await queryRunner.query(`DROP TABLE "fetcher_state"`);
        await queryRunner.query(`DROP TABLE "fetcher_run"`);
        await queryRunner.query(`DROP TABLE "event_log"`);
        await queryRunner.query(`DROP TABLE "cleaner"`);
        await queryRunner.query(`DROP INDEX "IDX_b16a5e04f01650d6b5e11a82a4"`);
        await queryRunner.query(`DROP INDEX "IDX_addba60dfc3d1830fd9beae17c"`);
        await queryRunner.query(`DROP TABLE "merit_field"`);
    }

}
