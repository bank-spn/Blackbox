CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(100) NOT NULL,
	`module` varchar(100) NOT NULL,
	`entity_type` varchar(100),
	`entity_id` int,
	`old_value` text,
	`new_value` text,
	`details` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashier_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`opened_at` timestamp NOT NULL DEFAULT (now()),
	`closed_at` timestamp,
	`opening_balance` int NOT NULL,
	`closing_balance` int,
	`total_cash` int,
	`total_card_payments` int,
	`discrepancy` int,
	`notes` text,
	`status` enum('open','closed') DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashier_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashier_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`type` enum('payment','adjustment','expense','deposit') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`reference` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashier_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`vendor` varchar(100),
	`receipt` text,
	`expense_date` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('revenue','expense','asset','liability') NOT NULL,
	`code` varchar(50),
	`description` text,
	`balance` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_accounts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` int NOT NULL,
	`type` enum('debit','credit') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`reference` varchar(100),
	`transaction_date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`type` enum('string','number','boolean','json') DEFAULT 'string',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
