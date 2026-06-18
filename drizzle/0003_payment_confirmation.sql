ALTER TABLE "bl_order_cache" ADD COLUMN "payment_confirmation_url" text;--> statement-breakpoint
ALTER TABLE "bl_order_cache" ADD COLUMN "payment_confirmation_at" timestamp;
