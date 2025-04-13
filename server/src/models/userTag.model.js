const db = require("../config/db");

const UserTag = {
  create: async (userId, tagId) => {
    const [result] = await db.query(
      "INSERT INTO user_tags (user_id, tag_id) VALUES (?, ?)",
      [userId, tagId]
    );
    return result.insertId;
  },

  delete: async (userId, tagId) => {
    const [result] = await db.query(
      "DELETE FROM user_tags WHERE user_id = ? AND tag_id = ?",
      [userId, tagId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = UserTag;
