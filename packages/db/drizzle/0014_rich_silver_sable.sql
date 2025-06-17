ALTER TABLE "file" ADD COLUMN "status" "file_status" DEFAULT 'processing' NOT NULL;--> statement-breakpoint
ALTER TABLE "file" DROP COLUMN "state";