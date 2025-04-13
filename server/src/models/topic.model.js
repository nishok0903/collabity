const db = require("../config/db");

const Topic = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM topics WHERE is_deleted = FALSE"
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM topics WHERE id = ? AND is_deleted = FALSE",
      [id]
    );
    return rows[0];
  },

  create: async (topicData) => {
    const {
      title,
      description,
      vacancies,
      total_vacancies,
      start_date,
      end_date,
      compensation,
      creator_id,
      status,
      approved,
    } = topicData;
    const [result] = await db.query(
      `INSERT INTO topics (title, description, vacancies, total_vacancies, start_date, end_date, compensation, creator_id, status, approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        vacancies,
        total_vacancies,
        start_date,
        end_date,
        compensation,
        creator_id,
        status,
        approved,
      ]
    );
    return result.insertId;
  },

  update: async (id, topicData) => {
    const [result] = await db.query("UPDATE topics SET ? WHERE id = ?", [
      topicData,
      id,
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query(
      "UPDATE topics SET is_deleted = TRUE WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Topic;
