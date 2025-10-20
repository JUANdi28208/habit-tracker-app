CREATE DATABASE habit_db;
CREATE USER 'habituser'@'localhost' IDENTIFIED BY 'habitpassword';
GRANT ALL PRIVILEGES ON habittracker.* TO 'habituser'@'localhost';
FLUSH PRIVILEGES;