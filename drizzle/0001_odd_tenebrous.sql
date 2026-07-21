ALTER TABLE `work_entries` ADD `expected_salary` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_entries` ADD `received_salary` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_entries` ADD `pending_salary` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_entries` ADD `salary_status` text DEFAULT 'pending';