const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const verifyToken = require("../middlewares/verifyToken");
const verifyType = require("../middlewares/verifyType");

router.use(verifyToken); // Middleware to verify bearer token
router.use(verifyType("faculty")); // Middleware to verify user role

// Temp upload config (file will be renamed later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/documents"),
  filename: (req, file, cb) => cb(null, `temp-${Date.now()}.pdf`),
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Max 4MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// POST /api/topics
router.post("/", upload.single("document"), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      researchTopic,
      topicDescription,
      vacancies,
      startDate,
      endDate,
      compensation,
      tags,
      user,
    } = req.body;

    await connection.beginTransaction();

    const [reqUser] = await connection.execute(
      `SELECT id FROM users WHERE firebase_uid = ? AND is_deleted = false`,
      [user]
    );
    // 1. Insert topic without document
    const [result] = await connection.execute(
      `
      INSERT INTO topics (
        title, description, vacancies, total_vacancies,
        start_date, end_date, compensation, creator_id,
        approved, status, is_deleted, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, 'inactive', false, NOW(), NOW())
    `,
      [
        researchTopic,
        topicDescription,
        vacancies,
        vacancies,
        startDate,
        endDate,
        compensation,
        reqUser[0].id,
      ]
    );

    const topicId = result.insertId;

    // 2. Rename uploaded file
    if (req.file) {
      const newFilePath = path.join("uploads/documents", `${topicId}.pdf`);
      fs.renameSync(req.file.path, newFilePath);
    }

    // 3. Insert topic_tags
    const tagIds = JSON.parse(tags); // Make sure tags are sent as JSON string (e.g., [1,2,3])
    for (const tagId of tagIds) {
      await connection.execute(
        `INSERT INTO topic_tags (topic_id, tag_id) VALUES (?, ?)`,
        [topicId, tagId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Topic created", topicId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating topic:", error);
    res.status(500).json({ message: "Server error", error: error.message });

    // Clean up uploaded file if it exists and fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  } finally {
    connection.release();
  }
});

router.get("/getRegisteredTopics", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { uid } = req.query; // Get the UID from the query parameters
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }
    const [user] = await connection.execute(
      `SELECT id FROM users WHERE firebase_uid = ?`,
      [uid]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user[0].id;
    console.log("User ID:", userId); // Log the user ID for debugging

    const [topics] = await connection.execute(
      `
      SELECT t.id, t.title, t.description, t.vacancies, t.total_vacancies,
             t.start_date, t.end_date,t.status, t.compensation, t.created_at,
             GROUP_CONCAT(tt.tag_id) AS tags
      FROM topics t
      LEFT JOIN topic_tags tt ON t.id = tt.topic_id
      WHERE t.creator_id = ? AND t.is_deleted = false
      GROUP BY t.id
    `,
      [userId]
    );

    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error fetching registered topics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
