CREATE TABLE "campaign_media" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campaign_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"cause_id" bigint NOT NULL,
	"media_type" text NOT NULL,
	"file_path" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "causes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"ngo_name" text,
	"slug" text,
	"description" text NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"goal_amount" numeric(12, 2) NOT NULL,
	"raised_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"image_url" text,
	"category" text NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"impact" text,
	"beneficiaries" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "causes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_name" text NOT NULL,
	"email" text,
	"phone" text,
	"receipt_number" text,
	"amount" numeric(12, 2) NOT NULL,
	"cause_id" integer NOT NULL,
	"status" text DEFAULT 'completed',
	"source" text DEFAULT 'website',
	"message" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"donated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_cause_id_causes_id_fk" FOREIGN KEY ("cause_id") REFERENCES "public"."causes"("id") ON DELETE no action ON UPDATE no action;