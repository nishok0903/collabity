const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middlewares/verifyToken");
const verifyType = require("../middlewares/verifyType");
const path = require("path");
const fs = require("fs");

router.use(verifyToken); // Middleware to verify bearer token
router.use(verifyType("student")); // Middleware to verify user role

router.get("/getFeed", async (req, res) => {
  const { firebase_uid } = req.query;

  if (!firebase_uid) {
    return res
      .status(400)
      .json({ error: "Missing firebase_uid query parameter" });
  }

  try {
    const connection = await db.getConnection();

    // 1. Get internal user ID from firebase_uid
    const [userRows] = await connection.query(
      "SELECT id, first_name, last_name, email FROM users WHERE firebase_uid = ? AND is_deleted = FALSE",
      [firebase_uid]
    );

    if (userRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRows[0].id;

    // 2. Get distinct tag IDs from user_tags
    const [tagRows] = await connection.query(
      "SELECT DISTINCT tag_id FROM user_tags WHERE user_id = ?",
      [userId]
    );

    if (tagRows.length === 0) {
      connection.release();
      return res.json({ topics: [] }); // No tags, so no topics
    }

    const tagIds = tagRows.map((row) => row.tag_id);

    // 3. Get distinct topic IDs from topic_tags
    const [topicIdRows] = await connection.query(
      `SELECT DISTINCT topic_id 
           FROM topic_tags 
           WHERE tag_id IN (?)`,
      [tagIds]
    );

    if (topicIdRows.length === 0) {
      connection.release();
      return res.json({ topics: [] }); // No topics matched
    }

    const topicIds = topicIdRows.map((row) => row.topic_id);

    // 4. Get topic details along with creator information and tags
    const [topicRows] = await connection.query(
      `SELECT t.id AS topic_id, t.title, t.description, t.vacancies, t.total_vacancies, 
                t.start_date, t.end_date, t.compensation, t.creator_id, t.status, 
                t.created_at, t.updated_at, 
                u.first_name AS creator_first_name, u.last_name AS creator_last_name, u.email AS creator_email
         FROM topics t
         JOIN users u ON t.creator_id = u.id
         WHERE t.id IN (?) AND t.is_deleted = FALSE AND t.status = 'inactive'`,
      [topicIds]
    );

    if (topicRows.length === 0) {
      connection.release();
      return res.json({ topics: [] }); // No topics found after filtering
    }

    // 5. Get the tags associated with each topic
    const [tagDetailsRows] = await connection.query(
      `SELECT tt.topic_id, GROUP_CONCAT(t.name) AS tags
         FROM topic_tags tt
         JOIN tags t ON tt.tag_id = t.id
         WHERE tt.topic_id IN (?)
         GROUP BY tt.topic_id`,
      [topicIds]
    );

    // 6. Get the applied topics for the user (to exclude them)
    const [appliedTopics] = await connection.query(
      `SELECT topic_id FROM participants WHERE student_id = ? AND is_deleted = FALSE`,
      [userId]
    );

    const appliedTopicIds = appliedTopics.map((row) => row.topic_id);

    // 7. Process the result to attach tags and filter out applied topics
    const topicWithTags = topicRows
      .filter((topic) => !appliedTopicIds.includes(topic.topic_id)) // Exclude applied topics
      .map((topic) => {
        const tagsForTopic = tagDetailsRows.find(
          (tagRow) => tagRow.topic_id === topic.topic_id
        );
        return {
          ...topic,
          tags: tagsForTopic ? tagsForTopic.tags.split(",") : [],
        };
      });

    connection.release();
    return res.json({ topics: topicWithTags });
  } catch (err) {
    console.error("Error fetching topics:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//2.

// Endpoint to get specific topic details
router.get("/getTopicDetails", async (req, res) => {
  const { topic_id } = req.query;

  if (!topic_id) {
    return res.status(400).json({ error: "Missing topic_id query parameter" });
  }

  try {
    const connection = await db.getConnection();

    // 1. Get topic details
    const [topicRows] = await connection.query(
      `SELECT t.id AS topic_id, t.title, t.description, t.vacancies, t.total_vacancies, 
                  t.start_date, t.end_date, t.compensation, t.creator_id, t.status, 
                  t.created_at, t.updated_at
           FROM topics t
           WHERE t.id = ? AND t.is_deleted = FALSE`,
      [topic_id]
    );

    if (topicRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Topic not found" });
    }

    const topic = topicRows[0];

    // 2. Get professor (creator) details
    const [creatorRows] = await connection.query(
      "SELECT first_name, last_name, email FROM users WHERE id = ? AND is_deleted = FALSE",
      [topic.creator_id]
    );

    if (creatorRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Professor not found" });
    }

    const creator = creatorRows[0];

    // 3. Get tags associated with the topic
    const [tagRows] = await connection.query(
      `SELECT t.name AS tag
           FROM topic_tags tt
           JOIN tags t ON tt.tag_id = t.id
           WHERE tt.topic_id = ?`,
      [topic_id]
    );

    const tags = tagRows.map((row) => row.tag);

    connection.release();

    // Dynamically generate the document link (assuming the document is stored in 'uploads/documents/')
    const documentLink = `http://localhost:5000/uploads/documents/${topic_id}.pdf`;

    // Return the topic details along with the professor details, associated tags, and the generated document link
    return res.json({
      topic: {
        ...topic,
        professor: {
          first_name: creator.first_name,
          last_name: creator.last_name,
          email: creator.email,
        },
        tags: tags,
        document_link: documentLink, // Add the generated document link
      },
    });
  } catch (err) {
    console.error("Error fetching topic details:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/downloadDocument/:topic_id", (req, res) => {
  const { topic_id } = req.params;
  const documentPath = path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "documents",
    `${topic_id}.pdf`
  );

  console.log("Document path:", documentPath);

  // Check if the file exists
  fs.exists(documentPath, (exists) => {
    if (!exists) {
      return res.status(404).json({ error: "Document not found" });
    }
    // Serve the file and force download
    res.download(documentPath, `${topic_id}.pdf`, (err) => {
      if (err) {
        console.error("Error downloading document:", err);
        return res.status(500).json({ error: "Error downloading document" });
      }
    });
  });
});

// Apply for a topic endpoint
router.post("/applyForTopic", verifyToken, async (req, res) => {
  const { topic_id, firebase_uid } = req.body; // Get topic_id and firebase_uid from the request body
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    // Find the user_id from firebase_uid in the users table
    const getUserQuery = `SELECT id FROM users WHERE firebase_uid = ? AND is_deleted = false`;
    const [userResult] = await db.execute(getUserQuery, [firebase_uid]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const student_id = userResult[0].id; // Get the user_id from the result
    console.log("Student ID:", student_id);
    console.log("Topic ID:", topic_id);
    // Check if the student is already applied for the topic
    const checkApplicationQuery = `SELECT * FROM participants WHERE topic_id = ? AND student_id = ? AND is_deleted = false`;
    const [existingApplication] = await db.execute(checkApplicationQuery, [
      topic_id,
      student_id,
    ]);

    if (existingApplication.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already applied for this topic." });
    }

    // Insert into the participants table
    const insertParticipantQuery = `INSERT INTO participants (topic_id, student_id, application_date, status) VALUES (?, ?, ?, 'applied')`;
    await db.execute(insertParticipantQuery, [
      topic_id,
      student_id,
      currentDate,
    ]);

    // Insert into the participant_logs table
    const insertLogQuery = `INSERT INTO participant_logs (topic_id, student_id, old_status, new_status, changed_by, change_reason) VALUES (?, ?, NULL, 'applied', ?, 'Applied for the topic')`;
    await db.execute(insertLogQuery, [topic_id, student_id, student_id]);

    // Send success response
    res.status(200).json({ message: "Successfully applied for the topic!" });
  } catch (error) {
    console.error("Error during application:", error);
    res
      .status(500)
      .json({ message: "An error occurred while applying for the topic." });
  }
});

// Get topics registered by a student
router.get("/topics", async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase user ID from the token
    console.log("User ID:", userId); // Log the user ID for debugging
    const query = `
    SELECT t.id, t.title, t.start_date, t.end_date, t.status
    FROM topics t
    JOIN participants p ON p.topic_id = t.id
    WHERE p.student_id = (SELECT id FROM users WHERE firebase_uid = ?)
      AND p.is_deleted = 0
  `;
    const [results] = await db.execute(query, [userId]);
    console.log("Fetched topics:", results); // Log the fetched topics for debugging
    // Return the topics in response
    res.json(results);
  } catch (err) {
    console.error("Error fetching topics:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Get student dashboard data (User, Topics, Stats) using firebase_uid
router.get("/dashboard/:firebase_uid", async (req, res) => {
  try {
    const { firebase_uid } = req.params; // Get firebase_uid from the request parameters
    const conn = await db.getConnection();

    // Get student details using firebase_uid
    const [studentUser] = await conn.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.rating
       FROM users u WHERE u.firebase_uid = ? AND u.role = 'student'`,
      [firebase_uid]
    );

    if (studentUser.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = studentUser[0].id;

    // Get the total number of topics the student is involved in
    const [[topicsCount]] = await conn.execute(
      `SELECT COUNT(*) AS totalTopics FROM participants p 
       JOIN topics t ON p.topic_id = t.id
       WHERE p.student_id = ? AND p.is_deleted = 0`,
      [studentId]
    );

    // Get the total number of topics the student has applied for or been accepted to
    const [[acceptedTopicsCount]] = await conn.execute(
      `SELECT COUNT(*) AS acceptedTopics FROM participants p 
       WHERE p.student_id = ? AND p.status IN ('accepted', 'in_progress', 'completed') AND p.is_deleted = 0`,
      [studentId]
    );

    // Get the average rating the student has received from topics or ratings
    const [[averageRating]] = await conn.execute(
      `SELECT ROUND(AVG(rating), 2) AS avgRating FROM ratings_log WHERE rated_user_id = ? AND is_deleted = 0`,
      [studentId]
    );

    // Get the status chart data showing how many topics the student is involved in for each status
    const [statusChart] = await conn.execute(
      `SELECT p.status, COUNT(*) AS count 
       FROM participants p 
       WHERE p.student_id = ? AND p.is_deleted = 0 
       GROUP BY p.status`,
      [studentId]
    );

    // Get the topic creation data showing how many topics have been created in each month
    const [creationChart] = await conn.execute(
      `SELECT DATE_FORMAT(t.created_at, '%Y-%m') AS month, COUNT(*) AS count 
       FROM topics t
       JOIN participants p ON t.id = p.topic_id
       WHERE p.student_id = ? AND t.is_deleted = 0
       GROUP BY month 
       ORDER BY month`,
      [studentId]
    );

    // Fetch all topics for this student for use in the frontend (for status-based distribution)
    const [topics] = await conn.execute(
      `SELECT t.id, t.title, p.status 
       FROM participants p 
       JOIN topics t ON p.topic_id = t.id
       WHERE p.student_id = ? AND p.is_deleted = 0`,
      [studentId]
    );

    conn.release();

    // Returning the data as JSON response
    return res.json({
      student: studentUser[0],
      stats: {
        totalTopics: topicsCount.totalTopics,
        acceptedTopics: acceptedTopicsCount.acceptedTopics,
        avgRating: averageRating.avgRating || 0,
      },
      charts: {
        topicStatus: statusChart,
        topicCreation: creationChart,
      },
      topics: topics, // Returning the topics to the frontend
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
