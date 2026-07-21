CREATE TABLE `owners` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone_number` text,
	`village` text,
	`notes` text,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`work_entry_id` text NOT NULL,
	`local_uri` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`work_entry_id`) REFERENCES `work_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `salary_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`work_entry_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_date` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`work_entry_id`) REFERENCES `work_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `salary_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`payment_type` text NOT NULL,
	`rate` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`work_entry_id` text NOT NULL,
	`trip_number` integer NOT NULL,
	`pickup_location` text,
	`drop_location` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`work_entry_id`) REFERENCES `work_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`registration_number` text,
	`type` text NOT NULL,
	`default_payment_method` text NOT NULL,
	`default_rate` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`owner_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`payment_type` text NOT NULL,
	`rate` real NOT NULL,
	`start_time` text,
	`end_time` text,
	`hours` real,
	`pickup_location` text,
	`drop_location` text,
	`notes` text,
	`trip_count` integer DEFAULT 0,
	`status` text,
	`is_completed` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
