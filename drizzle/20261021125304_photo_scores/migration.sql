CREATE TABLE "score" (
	"id" uuid PRIMARY KEY,
	"upload_id" uuid NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"score" real NOT NULL,
	"label" text NOT NULL,
	"face_count" integer NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "content_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "upload" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "upload" ADD CONSTRAINT "upload_path_key" UNIQUE("path");--> statement-breakpoint
CREATE INDEX "score_userId_createdAt_idx" ON "score" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_upload_id_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;