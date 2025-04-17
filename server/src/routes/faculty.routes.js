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

    // 2. Rename uploaded file if it exists
    if (req.file) {
      const newFilePath = path.join("uploads/documents", `${topicId}.pdf`);
      fs.renameSync(req.file.path, newFilePath);
    }

    // 3. Insert topic_tags (if tags are passed)
    const tagIds = tags ? JSON.parse(tags) : []; // Make sure tags are sent as JSON string (e.g., [1,2,3])
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

// GET /api/topics/getRegisteredTopics
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

    const [topics] = await connection.execute(
      `
      SELECT t.id, t.title, t.description, t.vacancies, t.total_vacancies,
             t.start_date, t.end_date, t.status, t.compensation, t.created_at,
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

// GET /api/topics/participants/:topicId
router.get("/participants/:topicId", async (req, res) => {
  const { topicId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT u.id as user_id, u.first_name, u.last_name, u.email, p.status
       FROM participants p
       JOIN users u ON p.student_id = u.id
       WHERE p.topic_id = ? AND p.is_deleted = FALSE`,
      [topicId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// GET /api/topics/topics/:topicId
router.get("/topics/:topicId", async (req, res) => {
  const { topicId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT total_vacancies, title FROM topics WHERE id = ? AND is_deleted = false`,
      [topicId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch topic details" });
  }
});

// PUT /api/topics/participants/:topicId/:studentId
router.put("/participants/:topicId/:studentId", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { topicId, studentId } = req.params;
    const { newStatus, reason, changedBy } = req.body;

    await connection.beginTransaction();

    // Get existing participant status
    const [existing] = await connection.execute(
      `SELECT status FROM participants WHERE topic_id = ? AND student_id = ?`,
      [topicId, studentId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Participant not found" });
    }

    const currentStatus = existing[0].status;

    // If status is same, skip update
    if (currentStatus === newStatus) {
      await connection.commit();
      return res.json({ message: "No change in status. Skipped update." });
    }

    // Update participant status
    await connection.execute(
      `UPDATE participants
       SET status = ?, updated_at = NOW()
       WHERE topic_id = ? AND student_id = ?`,
      [newStatus, topicId, studentId]
    );

    // Log change
    await connection.execute(
      `INSERT INTO participant_logs (topic_id, student_id, new_status, changed_by, change_reason)
       VALUES (?, ?, ?, (SELECT id FROM users WHERE firebase_uid = ? LIMIT 1), ?)`,

      [topicId, studentId, newStatus, req.user.uid, reason || null]
    );

    // Only reduce vacancy if new status is 'accepted'
    if (newStatus === "accepted" && currentStatus !== "accepted") {
      await connection.execute(
        `UPDATE topics
         SET vacancies = total_vacancies - (
           SELECT COUNT(*) FROM participants
           WHERE topic_id = ? AND status = 'accepted'
         )
         WHERE id = ?`,
        [topicId, topicId]
      );
    }

    await connection.commit();
    res.json({ message: "Participant status updated." });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating participant:", err);
    res.status(500).json({ error: "Failed to update participant" });
  } finally {
    connection.release();
  }
});

// PUT /api/faculty/startTopic/:topicId
router.put("/startTopic/:topicId", async (req, res) => {
  const { topicId } = req.params;
  const facultyUid = req.user?.uid; // from verifyToken middleware

  const connection = await db.getConnection();
  try {
    // Check if the topic exists
    const [topic] = await connection.execute(
      `SELECT id, start_date, status, total_vacancies FROM topics WHERE id = ? AND is_deleted = false`,
      [topicId]
    );

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const currentDate = new Date();
    const startDate = new Date(topic[0].start_date);

    if (currentDate < startDate) {
      return res
        .status(400)
        .json({ message: "Cannot start the topic before the start date." });
    }

    // Check if the selected participants count equals the total vacancies
    const [participants] = await connection.execute(
      `SELECT student_id FROM participants WHERE topic_id = ? AND status = 'accepted'`,
      [topicId]
    );

    const totalAccepted = participants.length;
    const totalVacancies = topic[0].total_vacancies;

    if (totalAccepted !== totalVacancies) {
      return res.status(400).json({
        message:
          "You need to select participants equal to the total vacancies before starting the topic.",
      });
    }

    // Get the faculty's internal user ID
    const [faculty] = await connection.execute(
      `SELECT id FROM users WHERE firebase_uid = ? LIMIT 1`,
      [facultyUid]
    );
    const facultyId = faculty[0]?.id;

    await connection.beginTransaction();

    // Update the participants' status to "in_progress"
    await connection.execute(
      `UPDATE participants SET status = 'in_progress' WHERE topic_id = ? AND status = 'accepted'`,
      [topicId]
    );

    // Log participant status changes
    for (const participant of participants) {
      await connection.execute(
        `INSERT INTO participant_logs (
          topic_id, student_id, old_status, new_status, changed_by, change_reason
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          topicId,
          participant.student_id,
          "accepted",
          "in_progress",
          facultyId,
          "Topic started by faculty",
        ]
      );
    }

    // Update topic status to "active"
    await connection.execute(
      `UPDATE topics SET status = 'active' WHERE id = ?`,
      [topicId]
    );

    await connection.commit();

    res.json({ message: "Topic started successfully and logs recorded." });
  } catch (err) {
    await connection.rollback();
    console.error("Error starting topic:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    connection.release();
  }
});

// PUT /api/faculty/completeTopic/:topicId
router.put("/completeTopic/:topicId", async (req, res) => {
  const { topicId } = req.params;
  const facultyUid = req.user?.uid; // from verifyToken middleware

  const connection = await db.getConnection();
  try {
    // Check if the topic exists and is active
    const [topic] = await connection.execute(
      `SELECT id, end_date, status FROM topics WHERE id = ? AND is_deleted = false`,
      [topicId]
    );

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const currentDate = new Date();
    const endDate = new Date(topic[0].end_date);

    if (currentDate < endDate) {
      return res
        .status(400)
        .json({ message: "Cannot complete the topic before the end date." });
    }

    // Get faculty internal ID
    const [faculty] = await connection.execute(
      `SELECT id FROM users WHERE firebase_uid = ? LIMIT 1`,
      [facultyUid]
    );
    const facultyId = faculty[0]?.id;

    await connection.beginTransaction();

    // Get all participants in progress
    const [participants] = await connection.execute(
      `SELECT student_id FROM participants WHERE topic_id = ? AND status = 'in_progress'`,
      [topicId]
    );

    // Update the participants' status to "completed"
    await connection.execute(
      `UPDATE participants SET status = 'completed' WHERE topic_id = ? AND status = 'in_progress'`,
      [topicId]
    );

    // Log each participant's status change
    for (const participant of participants) {
      await connection.execute(
        `INSERT INTO participant_logs (
          topic_id, student_id, old_status, new_status, changed_by, change_reason
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          topicId,
          participant.student_id,
          "in_progress",
          "completed",
          facultyId,
          "Topic completed by faculty",
        ]
      );
    }

    // Update the topic status to "completed"
    await connection.execute(
      `UPDATE topics SET status = 'completed' WHERE id = ?`,
      [topicId]
    );

    await connection.commit();

    res.json({
      message: "Topic and participants marked as completed successfully.",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error completing topic:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    connection.release();
  }
});

router.get("/dashboard/:firebase_uid", async (req, res) => {
  const { firebase_uid } = req.params;

  try {
    const conn = await db.getConnection();

    const [facultyUser] = await conn.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.rating, f.department, f.designation
       FROM users u, faculty_details f
       WHERE u.id = f.user_id AND u.is_deleted = 0 AND f.is_deleted = 0
       AND u.firebase_uid = ? AND u.role = 'faculty'`,
      [firebase_uid]
    );

    if (facultyUser.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const facultyId = facultyUser[0].id;

    const [[topicsCount]] = await conn.execute(
      `SELECT COUNT(*) AS totalTopics FROM topics WHERE creator_id = ? AND is_deleted = 0`,
      [facultyId]
    );

    const [[studentsCount]] = await conn.execute(
      `SELECT COUNT(DISTINCT p.student_id) AS totalStudents
       FROM participants p
       JOIN topics t ON p.topic_id = t.id
       WHERE t.creator_id = ? AND p.is_deleted = 0`,
      [facultyId]
    );

    const [[averageRating]] = await conn.execute(
      `SELECT ROUND(AVG(rating), 2) AS avgRating FROM ratings_log WHERE rated_user_id = ? AND is_deleted = 0`,
      [facultyId]
    );

    const [statusChart] = await conn.execute(
      `SELECT status, COUNT(*) AS count 
       FROM topics 
       WHERE creator_id = ? AND is_deleted = 0 
       GROUP BY status`,
      [facultyId]
    );

    const [creationChart] = await conn.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count 
       FROM topics 
       WHERE creator_id = ? AND is_deleted = 0 
       GROUP BY month 
       ORDER BY month`,
      [facultyId]
    );

    conn.release();

    return res.json({
      faculty: facultyUser[0],
      stats: {
        totalTopics: topicsCount.totalTopics,
        totalStudents: studentsCount.totalStudents,
        avgRating: averageRating.avgRating || 0,
      },
      charts: {
        topicStatus: statusChart,
        topicCreation: creationChart,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
