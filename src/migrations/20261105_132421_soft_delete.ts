import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum__projects_v_version_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum_services_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum__services_v_version_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum_journal_articles_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum__journal_articles_v_version_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum_testimonials_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum__testimonials_v_version_is_deleted" AS ENUM('N', 'Y');
  CREATE TYPE "public"."enum_enquiries_is_deleted" AS ENUM('N', 'Y');
  ALTER TABLE "projects" ADD COLUMN "is_deleted" "enum_projects_is_deleted" DEFAULT 'N';
  ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_projects_v" ADD COLUMN "version_is_deleted" "enum__projects_v_version_is_deleted" DEFAULT 'N';
  ALTER TABLE "_projects_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "is_deleted" "enum_services_is_deleted" DEFAULT 'N';
  ALTER TABLE "services" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_services_v" ADD COLUMN "version_is_deleted" "enum__services_v_version_is_deleted" DEFAULT 'N';
  ALTER TABLE "_services_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "journal_articles" ADD COLUMN "is_deleted" "enum_journal_articles_is_deleted" DEFAULT 'N';
  ALTER TABLE "journal_articles" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_journal_articles_v" ADD COLUMN "version_is_deleted" "enum__journal_articles_v_version_is_deleted" DEFAULT 'N';
  ALTER TABLE "_journal_articles_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "testimonials" ADD COLUMN "is_deleted" "enum_testimonials_is_deleted" DEFAULT 'N';
  ALTER TABLE "testimonials" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_is_deleted" "enum__testimonials_v_version_is_deleted" DEFAULT 'N';
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "enquiries" ADD COLUMN "is_deleted" "enum_enquiries_is_deleted" DEFAULT 'N';
  ALTER TABLE "enquiries" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  CREATE INDEX "projects_is_deleted_idx" ON "projects" USING btree ("is_deleted");
  CREATE INDEX "projects_deleted_at_idx" ON "projects" USING btree ("deleted_at");
  CREATE INDEX "_projects_v_version_version_is_deleted_idx" ON "_projects_v" USING btree ("version_is_deleted");
  CREATE INDEX "_projects_v_version_version_deleted_at_idx" ON "_projects_v" USING btree ("version_deleted_at");
  CREATE INDEX "services_is_deleted_idx" ON "services" USING btree ("is_deleted");
  CREATE INDEX "services_deleted_at_idx" ON "services" USING btree ("deleted_at");
  CREATE INDEX "_services_v_version_version_is_deleted_idx" ON "_services_v" USING btree ("version_is_deleted");
  CREATE INDEX "_services_v_version_version_deleted_at_idx" ON "_services_v" USING btree ("version_deleted_at");
  CREATE INDEX "journal_articles_is_deleted_idx" ON "journal_articles" USING btree ("is_deleted");
  CREATE INDEX "journal_articles_deleted_at_idx" ON "journal_articles" USING btree ("deleted_at");
  CREATE INDEX "_journal_articles_v_version_version_is_deleted_idx" ON "_journal_articles_v" USING btree ("version_is_deleted");
  CREATE INDEX "_journal_articles_v_version_version_deleted_at_idx" ON "_journal_articles_v" USING btree ("version_deleted_at");
  CREATE INDEX "testimonials_is_deleted_idx" ON "testimonials" USING btree ("is_deleted");
  CREATE INDEX "testimonials_deleted_at_idx" ON "testimonials" USING btree ("deleted_at");
  CREATE INDEX "_testimonials_v_version_version_is_deleted_idx" ON "_testimonials_v" USING btree ("version_is_deleted");
  CREATE INDEX "_testimonials_v_version_version_deleted_at_idx" ON "_testimonials_v" USING btree ("version_deleted_at");
  CREATE INDEX "enquiries_is_deleted_idx" ON "enquiries" USING btree ("is_deleted");
  CREATE INDEX "enquiries_deleted_at_idx" ON "enquiries" USING btree ("deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "projects_is_deleted_idx";
  DROP INDEX "projects_deleted_at_idx";
  DROP INDEX "_projects_v_version_version_is_deleted_idx";
  DROP INDEX "_projects_v_version_version_deleted_at_idx";
  DROP INDEX "services_is_deleted_idx";
  DROP INDEX "services_deleted_at_idx";
  DROP INDEX "_services_v_version_version_is_deleted_idx";
  DROP INDEX "_services_v_version_version_deleted_at_idx";
  DROP INDEX "journal_articles_is_deleted_idx";
  DROP INDEX "journal_articles_deleted_at_idx";
  DROP INDEX "_journal_articles_v_version_version_is_deleted_idx";
  DROP INDEX "_journal_articles_v_version_version_deleted_at_idx";
  DROP INDEX "testimonials_is_deleted_idx";
  DROP INDEX "testimonials_deleted_at_idx";
  DROP INDEX "_testimonials_v_version_version_is_deleted_idx";
  DROP INDEX "_testimonials_v_version_version_deleted_at_idx";
  DROP INDEX "enquiries_is_deleted_idx";
  DROP INDEX "enquiries_deleted_at_idx";
  ALTER TABLE "projects" DROP COLUMN "is_deleted";
  ALTER TABLE "projects" DROP COLUMN "deleted_at";
  ALTER TABLE "_projects_v" DROP COLUMN "version_is_deleted";
  ALTER TABLE "_projects_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "services" DROP COLUMN "is_deleted";
  ALTER TABLE "services" DROP COLUMN "deleted_at";
  ALTER TABLE "_services_v" DROP COLUMN "version_is_deleted";
  ALTER TABLE "_services_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "journal_articles" DROP COLUMN "is_deleted";
  ALTER TABLE "journal_articles" DROP COLUMN "deleted_at";
  ALTER TABLE "_journal_articles_v" DROP COLUMN "version_is_deleted";
  ALTER TABLE "_journal_articles_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "testimonials" DROP COLUMN "is_deleted";
  ALTER TABLE "testimonials" DROP COLUMN "deleted_at";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_is_deleted";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "enquiries" DROP COLUMN "is_deleted";
  ALTER TABLE "enquiries" DROP COLUMN "deleted_at";
  DROP TYPE "public"."enum_projects_is_deleted";
  DROP TYPE "public"."enum__projects_v_version_is_deleted";
  DROP TYPE "public"."enum_services_is_deleted";
  DROP TYPE "public"."enum__services_v_version_is_deleted";
  DROP TYPE "public"."enum_journal_articles_is_deleted";
  DROP TYPE "public"."enum__journal_articles_v_version_is_deleted";
  DROP TYPE "public"."enum_testimonials_is_deleted";
  DROP TYPE "public"."enum__testimonials_v_version_is_deleted";
  DROP TYPE "public"."enum_enquiries_is_deleted";`)
}
