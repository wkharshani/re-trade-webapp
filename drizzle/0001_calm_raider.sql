CREATE TYPE "public"."user_type" AS ENUM('seller', 'buyer');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" "user_type" DEFAULT 'buyer' NOT NULL;