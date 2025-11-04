CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(100),
	`phone` varchar(20),
	`address` text,
	`loyalty_points` int DEFAULT 0,
	`total_spent` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(100),
	`phone` varchar(20),
	`position` varchar(100) NOT NULL,
	`role` enum('manager','cashier','chef','waiter','staff') DEFAULT 'staff',
	`hire_date` date,
	`salary` int,
	`status` enum('active','inactive','on_leave') DEFAULT 'active',
	`address` text,
	`emergency_contact` varchar(150),
	`emergency_phone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`current_stock` int DEFAULT 0,
	`minimum_stock` int DEFAULT 0,
	`reorder_level` int DEFAULT 0,
	`unit_cost` int,
	`supplier_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`display_order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_item_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_item_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`options` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_item_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`cost` int,
	`image_url` text,
	`is_available` boolean DEFAULT true,
	`preparation_time` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`menu_item_id` int NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` int NOT NULL,
	`special_instructions` text,
	`status` enum('pending','preparing','ready','served') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`table_id` int,
	`order_date` timestamp DEFAULT (now()),
	`order_type` enum('dine_in','takeout','delivery') DEFAULT 'dine_in',
	`status` enum('pending','confirmed','preparing','ready','served','completed','cancelled') DEFAULT 'pending',
	`subtotal` int DEFAULT 0,
	`discount` int DEFAULT 0,
	`tax` int DEFAULT 0,
	`total` int DEFAULT 0,
	`payment_method` enum('cash','card','online','other'),
	`payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`amount` int NOT NULL,
	`method` enum('cash','card','online','other'),
	`reference` varchar(100),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchase_order_id` int NOT NULL,
	`ingredient_id` int NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplier_id` int NOT NULL,
	`order_date` timestamp DEFAULT (now()),
	`expected_delivery_date` date,
	`actual_delivery_date` date,
	`status` enum('pending','confirmed','delivered','cancelled') DEFAULT 'pending',
	`total_amount` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`table_id` int,
	`reservation_date` date NOT NULL,
	`reservation_time` varchar(5) NOT NULL,
	`party_size` int NOT NULL,
	`status` enum('confirmed','checked_in','completed','cancelled','no_show') DEFAULT 'confirmed',
	`special_requests` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`shift_date` date NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredient_id` int NOT NULL,
	`type` enum('in','out','adjustment'),
	`quantity` int NOT NULL,
	`reference` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`contact_person` varchar(100),
	`phone` varchar(20),
	`email` varchar(100),
	`address` text,
	`payment_terms` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_number` varchar(50) NOT NULL,
	`capacity` int NOT NULL,
	`location` varchar(100),
	`status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tables_id` PRIMARY KEY(`id`)
);
