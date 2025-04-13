const db = require("../config/db");

const StudentDetails = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM student_details WHERE user_id = ? AND is_deleted = FALSE",
      [userId]
    );
    return rows[0];
  },

  create: async (userId, studentData) => {
    const { enrollment_number, major, academic_year, gpa } = studentData;
    const [result] = await db.query(
      `INSERT INTO student_details (user_id, enrollment_number, major, academic_year, gpa) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, enrollment_number, major, academic_year, gpa]
    );
    return result.insertId;
  },

  update: async (userId, studentData) => {
    const [result] = await db.query(
      "UPDATE student_details SET ? WHERE user_id = ?",
      [studentData, userId]
    );
    return result.affectedRows > 0;
  },

  delete: async (userId) => {
    const [result] = await db.query(
      "UPDATE student_details SET is_deleted = TRUE WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = StudentDetails;
