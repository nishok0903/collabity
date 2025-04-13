const db = require("../config/db");

const TopicTag = {
  create: async (topicId, tagId) => {
    const [result] = await db.query(
      "INSERT INTO topic_tags (topic_id, tag_id) VALUES (?, ?)",
      [topicId, tagId]
    );
    return result.insertId;
  },

  delete: async (topicId, tagId) => {
    const [result] = await db.query(
      "DELETE FROM topic_tags WHERE topic_id = ? AND tag_id = ?",
      [topicId, tagId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = TopicTag;
