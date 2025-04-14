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
         WHERE t.id IN (?) AND t.is_deleted = FALSE`,
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

    // Decrease the vacancies for the topic
    const updateVacancyQuery = `UPDATE topics SET vacancies = vacancies - 1 WHERE id = ? AND vacancies > 0`;
    await db.execute(updateVacancyQuery, [topic_id]);

    // Send success response
    res.status(200).json({ message: "Successfully applied for the topic!" });
  } catch (error) {
    console.error("Error during application:", error);
    res
      .status(500)
      .json({ message: "An error occurred while applying for the topic." });
  }
});

module.exports = router;
