const express = require("express");
const tagRoutes = require("./routes/tag.routes");
const authRoutes = require("./routes/auth.routes");
const facultyRoutes = require("./routes/faculty.routes");
const studentRoutes = require("./routes/student.routes");
const errorHandler = require("./middlewares/errorHandler");
const verifyToken = require("./middlewares/verifyToken");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// Enable CORS for frontend at 5173
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true, // if you're sending cookies or authorization headers
  })
);

app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
app.use("/api/tags", tagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);

// POST /api/ratings
app.post("/api/ratings", async (req, res) => {
  const { userId, topicId, rating, role } = req.body;

  const connection = await db.getConnection();
  try {
    // Ensure that only faculty and participants can rate
    const validRoles = ["faculty", "participant"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role for rating." });
    }

    // Store the rating in the database
    await connection.execute(
      `INSERT INTO ratings (user_id, topic_id, rating, role, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, topicId, rating, role]
    );

    res.json({ message: "Rating submitted successfully." });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    connection.release();
  }
});

app.get("/api/profile/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // get tags for user.id
    const [tags] = await db.query(
      "SELECT * FROM tags WHERE id IN (SELECT DISTINCT tag_id FROM user_tags WHERE user_id = (SELECT id FROM users WHERE username = ?))",
      [username]
    );

    const [rows] = await db.query(
      `
      SELECT u.username, u.first_name, u.last_name, u.email, u.role,
             u.phone_number, u.address, u.linkedin_link, u.gender, u.date_of_birth,
             sd.enrollment_number, sd.major, sd.academic_year, sd.gpa,
             fd.department, fd.designation, fd.courses_teaching, fd.research_interests,
             fd.office_location, fd.contact_number, fd.google_scholar_link
      FROM users u
      LEFT JOIN student_details sd ON u.id = sd.user_id AND sd.is_deleted = 0
      LEFT JOIN faculty_details fd ON u.id = fd.user_id AND fd.is_deleted = 0
      WHERE u.username = ?
    `,
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ ...rows[0], tags });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✏️ PUT: Update Profile (Only owner)
app.put("/api/profile/:username", verifyToken, async (req, res) => {
  const { username } = req.params;

  try {
    const [userRows] = await db.query(
      "SELECT id, username, role FROM users WHERE firebase_uid = ?",
      [req.user.uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];
    if (user.username !== username) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      first_name,
      last_name,
      email,
      phone_number,
      address,
      linkedin_link,
      gender,
      date_of_birth,
      department,
      designation,
      courses_teaching,
      research_interests,
      office_location,
      contact_number,
      google_scholar_link,
      enrollment_number,
      major,
      academic_year,
      gpa,
    } = req.body;

    // 👨‍🏫 Faculty or 👨‍🎓 Student table
    if (user.role === "faculty") {
      const checkQuery = "SELECT id FROM faculty_details WHERE user_id = ?";
      const [existingFaculty] = await db.query(checkQuery, [user.id]);

      if (existingFaculty.length > 0) {
        // Update if exists
        const updateQuery = `
          UPDATE faculty_details
          SET department = ?, designation = ?, courses_teaching = ?, research_interests = ?, office_location = ?, contact_number = ?, google_scholar_link = ?
          WHERE user_id = ?
        `;
        const updateParams = [
          department,
          designation,
          courses_teaching,
          research_interests,
          office_location,
          contact_number,
          google_scholar_link,
          user.id,
        ];

        // Display the query and parameters before execution
        console.log("Executing Update Query: ", updateQuery);
        console.log("With Parameters: ", updateParams);

        await db.query(updateQuery, updateParams);
      } else {
        // Insert if not exists
        const insertQuery = `
          INSERT INTO faculty_details (user_id, department, designation, courses_teaching, research_interests, office_location, contact_number, google_scholar_link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertParams = [
          user.id,
          department,
          designation,
          courses_teaching,
          research_interests,
          office_location,
          contact_number,
          google_scholar_link,
        ];

        // Display the query and parameters before execution
        console.log("Executing Insert Query: ", insertQuery);
        console.log("With Parameters: ", insertParams);

        await db.query(insertQuery, insertParams);
      }
    } else if (user.role === "student") {
      const checkQuery = "SELECT id FROM student_details WHERE user_id = ?";
      const [existingStudent] = await db.query(checkQuery, [user.id]);

      if (existingStudent.length > 0) {
        // Update if exists
        const updateQuery = `
          UPDATE student_details
          SET enrollment_number = ?, major = ?, academic_year = ?, gpa = ?
          WHERE user_id = ?
        `;
        const updateParams = [
          enrollment_number,
          major,
          academic_year,
          gpa,
          user.id,
        ];

        // Display the query and parameters before execution
        console.log("Executing Update Query: ", updateQuery);
        console.log("With Parameters: ", updateParams);

        await db.query(updateQuery, updateParams);
      } else {
        // Insert if not exists
        const insertQuery = `
          INSERT INTO student_details (user_id, enrollment_number, major, academic_year, gpa)
          VALUES (?, ?, ?, ?, ?)
        `;
        const insertParams = [
          user.id,
          enrollment_number,
          major,
          academic_year,
          gpa,
        ];

        // Display the query and parameters before execution
        console.log("Executing Insert Query: ", insertQuery);
        console.log("With Parameters: ", insertParams);

        await db.query(insertQuery, insertParams);
      }
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use(errorHandler);

require("./cron");

const recoverMissedReports = require("./services/recoverMissedReports");
recoverMissedReports();

app.options("*", cors()); // handles preflight requests

module.exports = app;
