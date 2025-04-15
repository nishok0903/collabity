use collabity_v1;
-- 1. Insert faculty user
INSERT INTO users (
  firebase_uid,
  username,
  first_name,
  last_name,
  email,
  role
) VALUES (
  'SUdScRgynZM82QGIOvzhjdQTHSy2',
  'facultyuser01',
  'Test',
  'Faculty',
  'faculty@coll.test',
  'faculty'
);

-- 2. Insert into faculty_details (assumes the faculty user's ID is 1)
INSERT INTO faculty_details (
  user_id,
  department,
  designation,
  courses_teaching,
  research_interests,
  office_location,
  contact_number,
  google_scholar_link
) VALUES (
  1,
  'Computer Science',
  'Assistant Professor',
  'Web Technologies, AI',
  'AI, Machine Learning, Blockchain',
  'Room 204, CS Block',
  '9876543210',
  'https://scholar.google.com/faculty-profile'
);

-- 3. Insert student user
INSERT INTO users (
  firebase_uid,
  username,
  first_name,
  last_name,
  email,
  role
) VALUES (
  'aXcbCMknXKQD8yL3eP0NkuEMjyu2',
  'studentuser01',
  'Test',
  'Student',
  'student@coll.test',
  'student'
);

-- 4. Insert into student_details (assumes the student user's ID is 2)
INSERT INTO student_details (
  user_id,
  enrollment_number,
  major,
  academic_year,
  gpa
) VALUES (
  2,
  'ENR2025CS001',
  'Computer Science',
  'first_year',
  8.75
);
