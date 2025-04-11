create database collabity_v1_db;

use collabity_v1_db;

drop table users;

create table users (
uid integer primary key,
uname varchar(20),
lname varchar(20)
);

insert into users values (1, 'Nishok', 'A');

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(255) NOT NULL UNIQUE, 
  email VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'faculty') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from users;
SELECT * FROM users WHERE firebase_uid = 'DJbeRdLAx9dFwASZLAYhFxLZgaB3';

insert into users (firebase_uid, email) values ('DJbeRdLAx9dFwASZLAYhFxLZgaB3', 'nishok@coll.test');

-- final users table



