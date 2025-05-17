import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1747522568599 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "email_verified" boolean NOT NULL DEFAULT false,
        "phone" character varying NOT NULL,
        "password" character varying NOT NULL,
        CONSTRAINT "UQ_email" UNIQUE ("email"),
        CONSTRAINT "UQ_phone" UNIQUE ("phone"),
        CONSTRAINT "PK_id" PRIMARY KEY ("id")
      )
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP TABLE "user"');
	}

}
