-- Smart Traffic Management System Database Schema
-- MySQL Database Setup

-- Create database
CREATE DATABASE IF NOT EXISTS traffic_management;
USE traffic_management;

-- Create congestion_data table
CREATE TABLE IF NOT EXISTS congestion_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME NOT NULL,
    green_zone_count INT NOT NULL DEFAULT 0,
    yellow_zone_count INT NOT NULL DEFAULT 0,
    red_zone_count INT NOT NULL DEFAULT 0,
    total_vehicles INT GENERATED ALWAYS AS (green_zone_count + yellow_zone_count + red_zone_count) STORED,
    occupied_grid_cells INT DEFAULT 0,
    signal_status VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_signal_status (signal_status)
);

-- Create signal_history table
CREATE TABLE IF NOT EXISTS signal_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    duration_seconds INT NOT NULL,
    reason VARCHAR(100) DEFAULT 'automatic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_signal_type (signal_type)
);

-- Create system_stats table for analytics
CREATE TABLE IF NOT EXISTS system_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL UNIQUE,
    total_vehicles_detected INT DEFAULT 0,
    avg_congestion_level DECIMAL(5,2) DEFAULT 0.00,
    peak_congestion_time TIME,
    total_signal_changes INT DEFAULT 0,
    system_uptime_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO congestion_data (timestamp, green_zone_count, yellow_zone_count, red_zone_count, signal_status) VALUES
(NOW() - INTERVAL 10 MINUTE, 3, 5, 2, 'GREEN'),
(NOW() - INTERVAL 9 MINUTE, 4, 6, 3, 'GREEN'),
(NOW() - INTERVAL 8 MINUTE, 2, 4, 1, 'GREEN'),
(NOW() - INTERVAL 7 MINUTE, 5, 8, 4, 'YELLOW'),
(NOW() - INTERVAL 6 MINUTE, 6, 9, 5, 'RED'),
(NOW() - INTERVAL 5 MINUTE, 4, 7, 3, 'GREEN'),
(NOW() - INTERVAL 4 MINUTE, 3, 5, 2, 'GREEN'),
(NOW() - INTERVAL 3 MINUTE, 7, 10, 6, 'GREEN'),
(NOW() - INTERVAL 2 MINUTE, 5, 8, 4, 'YELLOW'),
(NOW() - INTERVAL 1 MINUTE, 6, 9, 5, 'RED');

-- Create views for analytics
CREATE VIEW daily_congestion_summary AS
SELECT 
    DATE(timestamp) as date,
    AVG(total_vehicles) as avg_vehicles,
    MAX(total_vehicles) as peak_vehicles,
    MIN(total_vehicles) as min_vehicles,
    COUNT(*) as total_readings
FROM congestion_data 
GROUP BY DATE(timestamp)
ORDER BY date DESC;

CREATE VIEW hourly_congestion_pattern AS
SELECT 
    HOUR(timestamp) as hour,
    AVG(total_vehicles) as avg_vehicles,
    AVG(green_zone_count) as avg_green,
    AVG(yellow_zone_count) as avg_yellow,
    AVG(red_zone_count) as avg_red,
    COUNT(*) as readings_count
FROM congestion_data 
GROUP BY HOUR(timestamp)
ORDER BY hour;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetCongestionStats(IN days_back INT)
BEGIN
    SELECT 
        DATE(timestamp) as date,
        AVG(total_vehicles) as avg_vehicles,
        MAX(total_vehicles) as peak_vehicles,
        COUNT(*) as total_readings,
        AVG(CASE WHEN signal_status = 'GREEN' THEN 1 ELSE 0 END) * 100 as green_percentage
    FROM congestion_data 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL days_back DAY)
    GROUP BY DATE(timestamp)
    ORDER BY date DESC;
END //

CREATE PROCEDURE CleanOldData(IN days_to_keep INT)
BEGIN
    DELETE FROM congestion_data 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    DELETE FROM signal_history 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END //

DELIMITER ;

-- Create user for the application (optional)
-- CREATE USER 'traffic_user'@'localhost' IDENTIFIED BY 'traffic_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON traffic_management.* TO 'traffic_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show table structure
DESCRIBE congestion_data;
DESCRIBE signal_history;
DESCRIBE system_stats;
