-- Hotel Reservation System Schema

-- Create Database if not exists (for local development)
CREATE DATABASE IF NOT EXISTS `hotel_reservation`;
USE `hotel_reservation`;

-- --------------------------------------------------------
-- Table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone_number` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `hotels`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hotel_name` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price_per_night` DECIMAL(10, 2) NOT NULL,
  `maximum_capacity` INT NOT NULL,
  `amenities` TEXT NOT NULL, -- Stored as comma-separated values or JSON text
  `image_url` VARCHAR(2048) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `reservations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `hotel_id` INT NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(50) NOT NULL,
  `reservation_date` DATE NOT NULL,
  `reservation_day` VARCHAR(100) NOT NULL, -- The day input (e.g. 'Monday', '2026-07-15')
  `number_of_persons` INT NOT NULL,
  `meal_preference` ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
  `stay_type` ENUM('Day Stay', 'Night Stay') NOT NULL,
  `special_notes` TEXT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT `fk_reservations_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_hotels` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance optimization
CREATE INDEX `idx_users_email` ON `users` (`email`);
CREATE INDEX `idx_hotels_city` ON `hotels` (`city`);
CREATE INDEX `idx_reservations_user` ON `reservations` (`user_id`);
CREATE INDEX `idx_reservations_hotel` ON `reservations` (`hotel_id`);
CREATE INDEX `idx_reservations_status` ON `reservations` (`status`);
