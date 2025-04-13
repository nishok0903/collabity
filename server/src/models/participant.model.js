const db = require("../config/db");

const Participant = {
  getAllByTopicId: async (topicId) => {
    const [rows] = await db.query(
      "SELECT * FROM participants WHERE topic_id = ? AND is_deleted = FALSE",
      [topicId]
    );
    return rows;
  },

  getByUserIdAndTopicId: async (topicId, studentId) => {
    const [rows] = await db.query(
      "SELECT * FROM participants WHERE topic_id = ? AND student_id = ? AND is_deleted = FALSE",
      [topicId, studentId]
    );
    return rows[0];
  },

  create: async (topicId, studentId, participantData) => {
    const { status, feedback, approved_by } = participantData;
    const [result] = await db.query(
      `INSERT INTO participants (topic_id, student_id, status, feedback, approved_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [topicId, studentId, status, feedback, approved_by]
    );
    return result.insertId;
  },

  update: async (topicId, studentId, participantData) => {
    const [result] = await db.query(
      "UPDATE participants SET ? WHERE topic_id = ? AND student_id = ?",
      [participantData, topicId, studentId]
    );
    return result.affectedRows > 0;
  },

  delete: async (topicId, studentId) => {
    const [result] = await db.query(
      "UPDATE participants SET is_deleted = TRUE WHERE topic_id = ? AND student_id = ?",
      [topicId, studentId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Participant;
