const db = require("../config/db");

const User = {
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE is_deleted = FALSE"
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ? AND is_deleted = FALSE",
      [id]
    );
    return rows[0];
  },

  getUserRole: async (uid) => {
    const [rows] = await db.query(
      "SELECT role FROM users WHERE firebase_uid = ? AND is_deleted = FALSE",
      [uid]
    );
    return rows[0];
  },

  create: async (userData) => {
    const {
      firebase_uid,
      username,
      first_name,
      last_name,
      email,
      phone_number,
      address,
      linkedin_link,
      gender,
      date_of_birth,
      role,
      rating,
      raters,
      approved,
    } = userData;
    const [result] = await db.query(
      `INSERT INTO users (firebase_uid, username, first_name, last_name, email, phone_number, address, linkedin_link, gender, date_of_birth, role, rating, raters, approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firebase_uid,
        username,
        first_name,
        last_name,
        email,
        phone_number,
        address,
        linkedin_link,
        gender,
        date_of_birth,
        role,
        rating,
        raters,
        approved,
      ]
    );
    return result.insertId;
  },

  update: async (id, userData) => {
    const [result] = await db.query("UPDATE users SET ? WHERE id = ?", [
      userData,
      id,
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query(
      "UPDATE users SET is_deleted = TRUE WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = User;
