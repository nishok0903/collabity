const express = require("express");
const admin = require("./firebaseAdmin");
const mysql = require("mysql2");
const app = express();
const port = 5000;

app.use(express.json()); // To parse JSON request bodies

// MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Route to handle new user registration
app.post("/api/register", async (req, res) => {
  const { firebaseUid, email, role } = req.body;

  if (!firebaseUid || !email || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if the user already exists in the database
    db.query(
      "SELECT * FROM users WHERE firebase_uid = ?",
      [firebaseUid],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Insert new user into the database
        db.query(
          "INSERT INTO users (firebase_uid, email, role) VALUES (?, ?, ?)",
          [firebaseUid, email, role],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Error saving user" });
            }
            res.status(201).json({ message: "User registered successfully" });
          }
        );
      }
    );
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
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to fetch the user's role from the MySQL database
const fetchUserRole = (req, res, next) => {
  const userId = req.user.uid; // Firebase UID is stored in req.user from the decoded token

  db.query(
    "SELECT role FROM users WHERE firebase_uid = ?",
    [userId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ message: "User role not found" });
      }

      req.user.role = results[0].role; // Attach the role to the request object
      next();
    }
  );
};

// Endpoint to verify token and return user role
app.post("/api/verify-token", verifyToken, fetchUserRole, (req, res) => {
  res.json({ role: req.user.role });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
