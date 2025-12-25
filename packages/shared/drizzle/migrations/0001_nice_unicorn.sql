PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`message_index` integer NOT NULL,
	`timestamp` text NOT NULL,
	`llm_provider` text,
	`llm_model` text,
	`llm_metadata` text,
	`attachments` text DEFAULT '[]' NOT NULL,
	`system_prompt` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chat_messages`("id", "session_id", "role", "content", "message_index", "timestamp", "llm_provider", "llm_model", "llm_metadata", "attachments", "system_prompt", "metadata") SELECT "id", "session_id", "role", "content", "message_index", "timestamp", "llm_provider", "llm_model", "llm_metadata", "attachments", "system_prompt", "metadata" FROM `chat_messages`;--> statement-breakpoint
DROP TABLE `chat_messages`;--> statement-breakpoint
ALTER TABLE `__new_chat_messages` RENAME TO `chat_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_chat_messages_session_id` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_timestamp` ON `chat_messages` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_role` ON `chat_messages` (`role`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_session_timestamp` ON `chat_messages` (`session_id`,`timestamp`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_chat_messages_session_message` ON `chat_messages` (`session_id`,`message_index`);