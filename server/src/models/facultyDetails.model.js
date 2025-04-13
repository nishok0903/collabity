const db = require("../config/db");

const FacultyDetails = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM faculty_details WHERE user_id = ? AND is_deleted = FALSE",
      [userId]
    );
    return rows[0];
  },

  create: async (userId, facultyData) => {
    const {
      department,
      designation,
      courses_teaching,
      research_interests,
      office_location,
      contact_number,
      google_scholar_link,
    } = facultyData;
    const [result] = await db.query(
      `INSERT INTO faculty_details (user_id, department, designation, courses_teaching, research_interests, office_location, contact_number, google_scholar_link) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        department,
        designation,
        courses_teaching,
        research_interests,
        office_location,
        contact_number,
        google_scholar_link,
      ]
    );
    return result.insertId;
  },

  update: async (userId, facultyData) => {
    const [result] = await db.query(
      "UPDATE faculty_details SET ? WHERE user_id = ?",
      [facultyData, userId]
    );
    return result.affectedRows > 0;
  },

  delete: async (userId) => {
    const [result] = await db.query(
      "UPDATE faculty_details SET is_deleted = TRUE WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = FacultyDetails;
