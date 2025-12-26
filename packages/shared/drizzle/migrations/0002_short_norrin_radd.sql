CREATE TABLE `chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`content` text NOT NULL,
	`contextual_content` text,
	`chunk_index` integer NOT NULL,
	`start_line` integer,
	`end_line` integer,
	`start_char` integer,
	`end_char` integer,
	`parent_header` text,
	`strategy` text NOT NULL,
	`token_count` integer,
	`hash` text NOT NULL,
	`prev_chunk_id` text,
	`next_chunk_id` text,
	`overlap_tokens` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chunks_file_id` ON `chunks` (`file_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_chunks_hash` ON `chunks` (`hash`);--> statement-breakpoint
CREATE INDEX `idx_chunks_chunk_index` ON `chunks` (`file_id`,`chunk_index`);--> statement-breakpoint
CREATE INDEX `idx_chunks_strategy` ON `chunks` (`strategy`);