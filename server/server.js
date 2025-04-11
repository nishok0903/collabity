const express = require("express");
const admin = require("./firebaseAdmin");
const mysql = require("mysql2");
const app = express();
const dotenv = require("dotenv");
const port = 5000;

app.use(express.json()); // To parse JSON request bodies

// MySQL connection
dotenv.config();

const db = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise(); // Use promise-based queries

// Route to handle new user registration
app.post("/api/register", async (req, res) => {
  const { firebaseUid, email, role } = req.body;

  console.log(req.body);

  if (!firebaseUid || !email || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  console.log("reached here");

  try {
    // Check if the user already exists in the database
    const [results] = await db.query(
      "SELECT * FROM users WHERE firebase_uid = ?;",
      [firebaseUid]
    );
    console.log("Query results:", results);

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Inserting new user into the database");
    // Insert new user into the database
    await db.query(
      "INSERT INTO users (firebase_uid, email, role) VALUES (?, ?, ?)",
      [firebaseUid, email, role]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to verify the Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from 'Authorization' header

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token); // Verify token with Firebase Admin SDK
    req.user = decoded; // Store the decoded user info in the request object
    console.log("Decoded token:", decoded); // Log the decoded token for debugging
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to fetch the user's role from the MySQL database
const fetchUserRole = async (req, res, next) => {
  const userId = req.user.uid; // Firebase UID is stored in req.user from the decoded token

  try {
    const [results] = await db.query(
      "SELECT role FROM users WHERE firebase_uid = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(500).json({ message: "User role not found" });
    }

    req.user.role = results[0].role; // Attach the role to the request object
    console.log("User role:", req.user.role); // Log the user role for debugging
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user role" });
  }
};

// Endpoint to verify token and return user role
app.post("/api/login", verifyToken, fetchUserRole, (req, res) => {
  res.json({ role: req.user.role });
});

// Check user role based on firebase_uid
app.post("/api/checkRole", async (req, res) => {
  const { firebase_uid } = req.body;

  if (!firebase_uid) {
    return res.status(400).json({ message: "firebase_uid is required." });
  }

  try {
    // Using async/await with mysql2
    const [rows] = await db.query(
      "SELECT role FROM users WHERE firebase_uid = ?",
      [firebase_uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the role of the user
    const userRole = rows[0].role;
    res.json({ role: userRole });
  } catch (err) {
    console.error("Error fetching role: ", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
