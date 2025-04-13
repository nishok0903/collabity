const db = require("../config/db");

const Tag = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM tags WHERE is_deleted = FALSE"
    );
    return rows;
  },

  create: async (name, color) => {
    const [result] = await db.query(
      "INSERT INTO tags (name, color) VALUES (?, ?)",
      [name, color]
    );
    return result.insertId;
  },

  delete: async (id) => {
    const [result] = await db.query(
      "UPDATE tags SET is_deleted = TRUE WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Tag;
