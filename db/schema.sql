CREATE DATABASE IF NOT EXISTS churn_db;
USE churn_db;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(120),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(40) NOT NULL UNIQUE,
  gender VARCHAR(10), senior_citizen TINYINT, partner VARCHAR(5), dependents VARCHAR(5),
  tenure INT, phone_service VARCHAR(5), multiple_lines VARCHAR(30),
  internet_service VARCHAR(20), online_security VARCHAR(30), online_backup VARCHAR(30),
  device_protection VARCHAR(30), tech_support VARCHAR(30),
  streaming_tv VARCHAR(30), streaming_movies VARCHAR(30),
  contract VARCHAR(20), paperless_billing VARCHAR(5), payment_method VARCHAR(40),
  monthly_charges DECIMAL(8,2), total_charges DECIMAL(10,2),
  actual_churn TINYINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE predictions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  probability DECIMAL(5,4) NOT NULL,
  risk_level ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  model_name VARCHAR(60) NOT NULL,
  status ENUM('COMPLETED','FAILED') DEFAULT 'COMPLETED',
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (customer_id, created_at), INDEX (risk_level),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE retention_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  status ENUM('REVIEWED','CONTACTED','OFFER_SENT','MONITORING','RESOLVED') NOT NULL,
  notes TEXT,
  acted_by BIGINT NULL,
  acted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (customer_id, acted_at),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (acted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('PREDICTION_COMPLETED','CUSTOMER_ADDED','CUSTOMER_UPDATED',
            'MOVED_TO_HIGH_RISK','SERVICE_UNAVAILABLE','RETENTION_ACTION') NOT NULL,
  customer_id BIGINT NULL, prediction_id BIGINT NULL,
  message VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (created_at)
);
