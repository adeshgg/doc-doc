CREATE TYPE "public"."file_status" AS ENUM('processing', 'done', 'failed');--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "state" "file_status" DEFAULT 'processing' NOT NULL;