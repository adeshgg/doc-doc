ALTER TABLE "public"."file" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "public"."file" ALTER COLUMN "state" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."file_status";--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('processing', 'indexed', 'failed');--> statement-breakpoint
ALTER TABLE "public"."file" ALTER COLUMN "state" SET DATA TYPE "public"."file_status" USING "state"::"public"."file_status";