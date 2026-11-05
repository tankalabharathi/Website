import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_enquiries_v_version_required_services" CASCADE;
  DROP TABLE "_enquiries_v" CASCADE;
  DROP TABLE "_enquiries_v_rels" CASCADE;
  DROP TYPE "public"."enum__enquiries_v_version_required_services";
  DROP TYPE "public"."enum__enquiries_v_version_property_type";
  DROP TYPE "public"."enum__enquiries_v_version_budget_range";
  DROP TYPE "public"."enum__enquiries_v_version_preferred_contact";
  DROP TYPE "public"."enum__enquiries_v_version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__enquiries_v_version_required_services" AS ENUM('Full-home interiors', 'Apartment interiors', 'Villa interiors', 'Modular kitchen', 'Bedrooms and wardrobes', 'Living and dining', 'Renovation', 'Commercial interiors', 'Turnkey design and execution');
  CREATE TYPE "public"."enum__enquiries_v_version_property_type" AS ENUM('Apartment', 'Villa', 'Independent home', 'Commercial space', 'Other');
  CREATE TYPE "public"."enum__enquiries_v_version_budget_range" AS ENUM('Under ₹10 lakh', '₹10–20 lakh', '₹20–40 lakh', '₹40–75 lakh', '₹75 lakh+');
  CREATE TYPE "public"."enum__enquiries_v_version_preferred_contact" AS ENUM('Phone', 'WhatsApp', 'Email');
  CREATE TYPE "public"."enum__enquiries_v_version_status" AS ENUM('new', 'contacted', 'qualified', 'scheduled', 'closed', 'archived');
  CREATE TABLE "_enquiries_v_version_required_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__enquiries_v_version_required_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_enquiries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_mobile" varchar NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_city" varchar NOT NULL,
  	"version_property_type" "enum__enquiries_v_version_property_type" NOT NULL,
  	"version_property_size" varchar,
  	"version_preferred_start_date" timestamp(3) with time zone,
  	"version_budget_range" "enum__enquiries_v_version_budget_range",
  	"version_description" varchar,
  	"version_preferred_contact" "enum__enquiries_v_version_preferred_contact" NOT NULL,
  	"version_status" "enum__enquiries_v_version_status" DEFAULT 'new',
  	"version_internal_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_enquiries_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  ALTER TABLE "_enquiries_v_version_required_services" ADD CONSTRAINT "_enquiries_v_version_required_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_enquiries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_enquiries_v" ADD CONSTRAINT "_enquiries_v_parent_id_enquiries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_enquiries_v_rels" ADD CONSTRAINT "_enquiries_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_enquiries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_enquiries_v_rels" ADD CONSTRAINT "_enquiries_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_enquiries_v_version_required_services_order_idx" ON "_enquiries_v_version_required_services" USING btree ("order");
  CREATE INDEX "_enquiries_v_version_required_services_parent_idx" ON "_enquiries_v_version_required_services" USING btree ("parent_id");
  CREATE INDEX "_enquiries_v_parent_idx" ON "_enquiries_v" USING btree ("parent_id");
  CREATE INDEX "_enquiries_v_version_version_updated_at_idx" ON "_enquiries_v" USING btree ("version_updated_at");
  CREATE INDEX "_enquiries_v_version_version_created_at_idx" ON "_enquiries_v" USING btree ("version_created_at");
  CREATE INDEX "_enquiries_v_created_at_idx" ON "_enquiries_v" USING btree ("created_at");
  CREATE INDEX "_enquiries_v_updated_at_idx" ON "_enquiries_v" USING btree ("updated_at");
  CREATE INDEX "_enquiries_v_rels_order_idx" ON "_enquiries_v_rels" USING btree ("order");
  CREATE INDEX "_enquiries_v_rels_parent_idx" ON "_enquiries_v_rels" USING btree ("parent_id");
  CREATE INDEX "_enquiries_v_rels_path_idx" ON "_enquiries_v_rels" USING btree ("path");
  CREATE INDEX "_enquiries_v_rels_admins_id_idx" ON "_enquiries_v_rels" USING btree ("admins_id");`)
}
