const db = require("../config/db");

module.exports = (requiredRole) => {
  return async (req, res, next) => {
    const [rows] = await db.query(
      "SELECT role FROM users WHERE firebase_uid = ?",
      [req.user.uid]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const userRole = rows[0].role;
    if (userRole !== requiredRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (userRole === requiredRole) {
      req.user.role = userRole; // Add the role to the request object

      next();
    }
  };
};
