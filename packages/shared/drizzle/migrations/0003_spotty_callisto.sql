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
CREATE INDEX `idx_chunks_strategy` ON `chunks` (`strategy`);--> statement-breakpoint
CREATE TABLE `embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`chunk_id` text NOT NULL,
	`vector` blob NOT NULL,
	`model_id` text NOT NULL,
	`dimensions` integer NOT NULL,
	`normalized_magnitude` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chunk_id`) REFERENCES `chunks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `embeddings_chunk_id_idx` ON `embeddings` (`chunk_id`);--> statement-breakpoint
CREATE INDEX `embeddings_model_id_idx` ON `embeddings` (`model_id`);--> statement-breakpoint
CREATE TABLE `chunk_entities` (
	`chunk_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`mention_count` integer DEFAULT 1 NOT NULL,
	`positions` text DEFAULT '[]' NOT NULL,
	PRIMARY KEY(`chunk_id`, `entity_id`),
	FOREIGN KEY (`chunk_id`) REFERENCES `chunks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chunk_entities_chunk_id_idx` ON `chunk_entities` (`chunk_id`);--> statement-breakpoint
CREATE INDEX `chunk_entities_entity_id_idx` ON `chunk_entities` (`entity_id`);--> statement-breakpoint
CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`level` integer DEFAULT 0 NOT NULL,
	`parent_id` text,
	`name` text NOT NULL,
	`summary` text NOT NULL,
	`member_count` integer DEFAULT 0 NOT NULL,
	`embedding` blob,
	`embedding_model_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `communities_level_idx` ON `communities` (`level`);--> statement-breakpoint
CREATE INDEX `communities_parent_id_idx` ON `communities` (`parent_id`);--> statement-breakpoint
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`aliases` text DEFAULT '[]' NOT NULL,
	`embedding` blob,
	`embedding_model_id` text,
	`importance` real DEFAULT 0.5 NOT NULL,
	`mention_count` integer DEFAULT 1 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entities_normalized_name_idx` ON `entities` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `entities_type_idx` ON `entities` (`type`);--> statement-breakpoint
CREATE INDEX `entities_importance_idx` ON `entities` (`importance`);--> statement-breakpoint
CREATE UNIQUE INDEX `entities_name_type_idx` ON `entities` (`normalized_name`,`type`);--> statement-breakpoint
CREATE TABLE `entity_communities` (
	`entity_id` text NOT NULL,
	`community_id` text NOT NULL,
	PRIMARY KEY(`entity_id`, `community_id`),
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `entity_communities_entity_id_idx` ON `entity_communities` (`entity_id`);--> statement-breakpoint
CREATE INDEX `entity_communities_community_id_idx` ON `entity_communities` (`community_id`);--> statement-breakpoint
CREATE TABLE `relations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`target_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`weight` real DEFAULT 0.5 NOT NULL,
	`bidirectional` integer DEFAULT 0 NOT NULL,
	`evidence_count` integer DEFAULT 1 NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `relations_source_id_idx` ON `relations` (`source_id`);--> statement-breakpoint
CREATE INDEX `relations_target_id_idx` ON `relations` (`target_id`);--> statement-breakpoint
CREATE INDEX `relations_type_idx` ON `relations` (`type`);--> statement-breakpoint
CREATE INDEX `relations_weight_idx` ON `relations` (`weight`);--> statement-breakpoint
CREATE UNIQUE INDEX `relations_source_target_type_idx` ON `relations` (`source_id`,`target_id`,`type`);--> statement-breakpoint
CREATE TABLE `relation_evidence` (
	`relation_id` text NOT NULL,
	`chunk_id` text NOT NULL,
	`excerpt` text NOT NULL,
	`confidence` real DEFAULT 0.5 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`relation_id`, `chunk_id`),
	FOREIGN KEY (`relation_id`) REFERENCES `relations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chunk_id`) REFERENCES `chunks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `relation_evidence_relation_id_idx` ON `relation_evidence` (`relation_id`);--> statement-breakpoint
CREATE INDEX `relation_evidence_chunk_id_idx` ON `relation_evidence` (`chunk_id`);