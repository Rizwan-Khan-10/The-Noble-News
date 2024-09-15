CREATE DATABASE user_login_db;

USE user_login_db;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL,
something VARCHAR(100)
);

CREATE TABLE saved_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    title VARCHAR(255),
    img TEXT,
    source VARCHAR(255),
    description TEXT
);

SELECT * FROM users;
SELECT * FROM saved_news;