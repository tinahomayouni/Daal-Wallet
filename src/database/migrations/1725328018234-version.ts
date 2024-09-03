import { MigrationInterface, QueryRunner } from "typeorm";

export class Version1725328018234 implements MigrationInterface {
    name = 'Version1725328018234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "balance" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "balance" integer NOT NULL DEFAULT '0'`);
    }

}
