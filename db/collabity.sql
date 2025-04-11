-- Create the database
-- CREATE DATABASE collabity_v1;

-- Use the newly created database
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


-- Create the 'users' table with soft delete
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,                        -- Unique internal ID for each user

    firebase_uid VARCHAR(255) NOT NULL UNIQUE,                -- Firebase-generated unique identifier

    username VARCHAR(100) NOT NULL UNIQUE,                    -- Username (must be unique)
    first_name VARCHAR(50) NOT NULL,                          -- User's first name
    last_name VARCHAR(50) NOT NULL,                           -- User's last name

    email VARCHAR(100) UNIQUE NOT NULL,                       -- User's email address (must be unique)
    phone_number VARCHAR(20),                                 -- User's contact phone number
    address TEXT,                                              -- Optional physical address
    linkedin_link VARCHAR(255) DEFAULT NULL,                  -- Optional LinkedIn profile URL

    gender ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') 
        DEFAULT 'prefer_not_to_say',                          -- Gender identity

    date_of_birth DATE,                                       -- User's date of birth

    role ENUM('student', 'faculty', 'admin') 
        NOT NULL DEFAULT 'student',                           -- User's role in the system

    rating DECIMAL(3,2) DEFAULT 0.00 
        CHECK (rating >= 0 AND rating <= 5),                  -- Average rating (0.00 to 5.00)

    raters INT DEFAULT 0 
        CHECK (raters >= 0),                                  -- Number of users who rated this user

    approved BOOLEAN DEFAULT FALSE,                           -- Indicates if the user's profile is approved

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Timestamp when the record was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,                          -- Timestamp when the record was last updated

    is_deleted BOOLEAN DEFAULT FALSE,                         -- Soft delete flag (TRUE if deleted)
    
    -- Indexes for performance optimization on frequent lookups
    INDEX idx_email (email),                                  -- Fast lookup by email
    INDEX idx_username (username),                            -- Fast lookup by username
    INDEX idx_role (role),                                    -- Fast filtering by role
    INDEX idx_approved (approved)                             -- Fast filtering by approval status
);

-- Faculty-specific details table with soft delete
CREATE TABLE faculty_details (
    id INT PRIMARY KEY AUTO_INCREMENT,          -- Unique ID for each faculty record
    user_id INT NOT NULL,                       -- Foreign Key to users table

    department VARCHAR(100) NOT NULL,           -- Department the faculty belongs to
    designation VARCHAR(50) NOT NULL,           -- Faculty designation (e.g., Professor, Assistant Professor)
    courses_teaching TEXT,                      -- List of courses faculty is teaching
    research_interests TEXT,                    -- Research areas of interest
    office_location VARCHAR(100),               -- Office location of the faculty
    contact_number VARCHAR(20),                 -- Faculty's contact number (if different from general user info)
    google_scholar_link VARCHAR(255),           -- Optional Google Scholar profile link

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the record was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Timestamp when the record was last updated

    is_deleted BOOLEAN DEFAULT FALSE,            -- Soft delete flag

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  -- Foreign Key constraint to users
);


-- Student-specific details table with soft delete
CREATE TABLE student_details (
    id INT PRIMARY KEY AUTO_INCREMENT,          -- Unique ID for each student record
    user_id INT NOT NULL,                       -- Foreign Key to users table
    enrollment_number VARCHAR(50) NOT NULL,     -- Unique enrollment number for the student
    major VARCHAR(100),                         -- Major or course the student is pursuing
    academic_year ENUM('first_year', 'second_year', 'third_year', 'fourth_year', 'graduate') 
        NOT NULL,                               -- Academic year (first-year, second-year, etc.)
    gpa DECIMAL(3,2) DEFAULT NULL,              -- GPA of the student
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the record was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Timestamp when the record was last updated

    is_deleted BOOLEAN DEFAULT FALSE,            -- Soft delete flag
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE      -- Foreign Key constraint to users
);

-- Create the 'topics' table with soft delete
CREATE TABLE topics (
    id INT PRIMARY KEY AUTO_INCREMENT,              -- Unique ID for each topic
    title VARCHAR(255) NOT NULL,                    -- Title of the research topic
    description TEXT,                               -- Detailed description of the research topic
    vacancies INT NOT NULL,                         -- Number of vacancies available
    total_vacancies INT NOT NULL,                   -- Total number of available vacancies for this topic
    start_date DATE,                                -- Start date of the research topic
    end_date DATE,                                  -- End date of the research topic
    compensation INT,                               -- Compensation for the research topic (INR)
    creator_id INT NOT NULL,                        -- ID of the user who created the topic (Foreign Key)
    approved BOOLEAN DEFAULT FALSE,                 -- Whether the topic is approved (true/false)
    status ENUM('active', 'inactive', 'completed', 'done') NOT NULL DEFAULT 'inactive',  -- Status of the topic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the topic was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- When the topic was last updated

    is_deleted BOOLEAN DEFAULT FALSE,               -- Soft delete flag
    
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,  -- Foreign Key to the users table
    CONSTRAINT chk_date CHECK (start_date <= end_date),  -- Ensures start date is before or equal to end date
    CONSTRAINT chk_vacancies CHECK (vacancies < total_vacancies)  -- Ensures vacancies is less than total_vacancies
);

-- Create the 'tags' table with soft delete
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,      -- Unique ID for each tag
    name VARCHAR(255) NOT NULL,             -- Name of the tag (e.g., "AI", "Machine Learning")
    color VARCHAR(7) NOT NULL UNIQUE,       -- Color associated with the tag (e.g., "#3498db" for blue), must be unique
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the tag was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- When the tag was last updated

    is_deleted BOOLEAN DEFAULT FALSE        -- Soft delete flag
);

-- Create the 'user_tags' mapping table (many-to-many relationship between users and tags) with soft delete
CREATE TABLE user_tags (
    user_id INT,                        -- Foreign Key to users
    tag_id INT,                         -- Foreign Key to tags
    PRIMARY KEY (user_id, tag_id),      -- Composite Primary Key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Foreign Key to users
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE   -- Foreign Key to tags
);

-- Create the 'topic_tags' mapping table (many-to-many relationship between topics and tags) with soft delete
CREATE TABLE topic_tags (
    topic_id INT,                       -- Foreign Key to topics
    tag_id INT,                          -- Foreign Key to tags
    PRIMARY KEY (topic_id, tag_id),     -- Composite Primary Key
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,  -- Foreign Key to topics
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE     -- Foreign Key to tags
);

-- Create the 'participants' table to track students applying for topics with soft delete
CREATE TABLE participants (
    topic_id INT NOT NULL,                                     -- Reference to the topic
    student_id INT NOT NULL,                                   -- Reference to the student (user)

    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- When the student applied
    status ENUM(
        'applied',         -- Application submitted, pending review
        'accepted',        -- Accepted but not yet joined
        'rejected',        -- Application rejected
        'done',            -- Topic has ended
        'in_progress',     -- Actively working on the topic
        'completed',       -- Successfully completed the topic after review
        'withdrawn'        -- Voluntarily exited the topic
    ) NOT NULL DEFAULT 'applied',

    feedback TEXT DEFAULT NULL,                                -- Optional feedback by faculty or system

    approved_by INT DEFAULT NULL,                              -- Faculty/admin who approved the student (nullable)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            -- Record creation time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,                           -- Record update time

    is_deleted BOOLEAN DEFAULT FALSE,                          -- Soft delete flag

    -- Composite Primary Key to ensure one application per student per topic
    PRIMARY KEY (topic_id, student_id),

    -- Foreign Key constraints
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE participant_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,                  -- Unique log ID

    topic_id INT NOT NULL,                              -- Reference to the topic
    student_id INT NOT NULL,                            -- Reference to the student (user)

    old_status ENUM(
        'applied', 'accepted', 'rejected', 'done',
        'in_progress', 'completed', 'withdrawn'
    ) DEFAULT NULL,                                     -- Previous status (can be NULL for first change)

    new_status ENUM(
        'applied', 'accepted', 'rejected', 'done',
        'in_progress', 'completed', 'withdrawn'
    ) NOT NULL,                                         -- New status

    changed_by INT DEFAULT NULL,                        -- User (likely faculty/admin) who made the change
    change_reason TEXT DEFAULT NULL,                    -- Optional reason for the status change

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Time of change
    is_deleted BOOLEAN DEFAULT FALSE,                   -- Soft delete flag

    -- Foreign key constraints
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes for faster log lookup
    INDEX idx_log_topic (topic_id),
    INDEX idx_log_student (student_id),
    INDEX idx_log_changed_by (changed_by)
);


-- Create the 'ratings_log' table to track ratings given by users with soft delete
CREATE TABLE ratings_log (
    id INT PRIMARY KEY AUTO_INCREMENT,

    rater_id INT NOT NULL,                         -- User who gave the rating
    rated_user_id INT NOT NULL,                    -- User who received the rating

    topic_id INT DEFAULT NULL,                     -- Optional: rating context (e.g., topic-specific)
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    review TEXT DEFAULT NULL,                      -- Optional review comment

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_deleted BOOLEAN DEFAULT FALSE,             -- Soft delete flag

    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);
