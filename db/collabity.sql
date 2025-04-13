-- Create the database
-- CREATE DATABASE collabity_v1;

-- Use database
USE collabity_v1;

-- Drop the mapping tables first to avoid foreign key dependency issues
DROP TABLE IF EXISTS user_tags;  -- Drop user_tag mapping table
DROP TABLE IF EXISTS topic_tags; -- Drop topic_tag mapping table
DROP TABLE IF EXISTS ratings_log; -- Drop ratings_log table
DROP TABLE IF EXISTS participant_logs; -- Drop participant_logs table
DROP TABLE IF EXISTS participants; -- Drop participants table
DROP TABLE IF EXISTS student_details; -- Drop student_details table
DROP TABLE IF EXISTS faculty_details; -- Drop faculty_details table

-- Now drop the main tables
DROP TABLE IF EXISTS tags;  -- Drop tags table
DROP TABLE IF EXISTS topics;  -- Drop topics table
DROP TABLE IF EXISTS users;  -- Drop users table


-- Create the 'users' table with soft delete and indexes
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    linkedin_link VARCHAR(255) DEFAULT NULL,
    gender ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',
    date_of_birth DATE,
    role ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    raters INT DEFAULT 0 CHECK (raters >= 0),
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_approved (approved)
);

-- Faculty table with index on user_id
CREATE TABLE faculty_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    courses_teaching TEXT,
    research_interests TEXT,
    office_location VARCHAR(100),
    contact_number VARCHAR(20),
    google_scholar_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_faculty_user_id (user_id)
);

-- Student table with index on user_id and enrollment number
CREATE TABLE student_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    enrollment_number VARCHAR(50) NOT NULL,
    major VARCHAR(100),
    academic_year ENUM('first_year', 'second_year', 'third_year', 'fourth_year', 'graduate') NOT NULL,
    gpa DECIMAL(3,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_user_id (user_id),
    INDEX idx_enrollment_number (enrollment_number)
);

-- Topics table with useful indexes
CREATE TABLE topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vacancies INT NOT NULL,
    total_vacancies INT NOT NULL,
    start_date DATE,
    end_date DATE,
    compensation INT,
    creator_id INT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'completed', 'done') NOT NULL DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_date CHECK (start_date <= end_date),
    CONSTRAINT chk_vacancies CHECK (vacancies < total_vacancies),

    INDEX idx_topic_creator (creator_id),
    INDEX idx_topic_status (status),
    INDEX idx_topic_approved (approved),
    INDEX idx_topic_dates (start_date, end_date)
);

-- Tags table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- user_tags table
CREATE TABLE user_tags (
    user_id INT,
    tag_id INT,
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- topic_tags table
CREATE TABLE topic_tags (
    topic_id INT,
    tag_id INT,
    PRIMARY KEY (topic_id, tag_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- participants table
CREATE TABLE participants (
    topic_id INT NOT NULL,
    student_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('applied','accepted','rejected','done','in_progress','completed','withdrawn') NOT NULL DEFAULT 'applied',
    feedback TEXT DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (topic_id, student_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_participant_status (status),
    INDEX idx_participant_approved_by (approved_by)
);

-- participant_logs table
CREATE TABLE participant_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    student_id INT NOT NULL,
    old_status ENUM('applied', 'accepted', 'rejected', 'done', 'in_progress', 'completed', 'withdrawn') DEFAULT NULL,
    new_status ENUM('applied', 'accepted', 'rejected', 'done', 'in_progress', 'completed', 'withdrawn') NOT NULL,
    changed_by INT DEFAULT NULL,
    change_reason TEXT DEFAULT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_log_topic (topic_id),
    INDEX idx_log_student (student_id),
    INDEX idx_log_changed_by (changed_by),
    INDEX idx_log_status (new_status)
);

-- ratings_log table
CREATE TABLE ratings_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rater_id INT NOT NULL,
    rated_user_id INT NOT NULL,
    topic_id INT DEFAULT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    review TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,

    INDEX idx_rating_pair (rater_id, rated_user_id),
    INDEX idx_rating_topic (topic_id)
);
