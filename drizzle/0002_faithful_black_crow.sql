ALTER TABLE "bl_order_cache" ADD COLUMN "delivery_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bl_order_cache" ADD COLUMN "delivery_method" varchar(100);--> statement-breakpoint
ALTER TABLE "bl_order_cache" ADD COLUMN "tracking_number" varchar(255);--> statement-breakpoint
ALTER TABLE "bl_order_cache" ADD COLUMN "user_comments" text;