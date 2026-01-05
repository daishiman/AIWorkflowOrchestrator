CREATE TABLE `conversions` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`converter_id` text NOT NULL,
	`input_hash` text NOT NULL,
	`output_hash` text,
	`duration` integer,
	`input_size` integer,
	`output_size` integer,
	`error` text,
	`error_details` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversions_file_id_idx` ON `conversions` (`file_id`);--> statement-breakpoint
CREATE INDEX `conversions_status_idx` ON `conversions` (`status`);--> statement-breakpoint
CREATE INDEX `conversions_input_hash_idx` ON `conversions` (`input_hash`);--> statement-breakpoint
CREATE INDEX `conversions_created_at_idx` ON `conversions` (`created_at`);--> statement-breakpoint
CREATE INDEX `conversions_file_status_idx` ON `conversions` (`file_id`,`status`);--> statement-breakpoint
CREATE TABLE `extracted_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`conversion_id` text NOT NULL,
	`title` text,
	`author` text,
	`language` text,
	`word_count` integer DEFAULT 0 NOT NULL,
	`line_count` integer DEFAULT 0 NOT NULL,
	`char_count` integer DEFAULT 0 NOT NULL,
	`code_blocks` integer DEFAULT 0 NOT NULL,
	`headers` text DEFAULT '[]',
	`links` text DEFAULT '[]',
	`custom` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`conversion_id`) REFERENCES `conversions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extracted_metadata_conversion_id_idx` ON `extracted_metadata` (`conversion_id`);--> statement-breakpoint
CREATE INDEX `extracted_metadata_language_idx` ON `extracted_metadata` (`language`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`mime_type` text NOT NULL,
	`category` text NOT NULL,
	`size` integer NOT NULL,
	`hash` text NOT NULL,
	`encoding` text DEFAULT 'utf-8' NOT NULL,
	`last_modified` integer NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_hash_idx` ON `files` (`hash`);--> statement-breakpoint
CREATE INDEX `files_path_idx` ON `files` (`path`);--> statement-breakpoint
CREATE INDEX `files_mime_type_idx` ON `files` (`mime_type`);--> statement-breakpoint
CREATE INDEX `files_category_idx` ON `files` (`category`);--> statement-breakpoint
CREATE INDEX `files_created_at_idx` ON `files` (`created_at`);