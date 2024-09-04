import { MigrationInterface, QueryRunner } from "typeorm";

export class Version1725448267361 implements MigrationInterface {
    name = 'Version1725448267361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "UQ_be7167bad72d966eed3d6b6af39"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "amount" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "amount" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "UQ_be7167bad72d966eed3d6b6af39" UNIQUE ("referenceId")`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "timestamp" TIMESTAMP NOT NULL`);
    }

}
