const User = require("../models/user.model");

exports.checkRole = async (req, res, next) => {
  const { firebase_uid } = req.query;

  if (!firebase_uid) {
    return res
      .status(400)
      .json({ message: "firebase_uid is required as a query parameter." });
  }

  try {
    const user = await User.getByUid(firebase_uid);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const {
      firebase_uid,
      username,
      first_name,
      last_name,
      email,
      role,
      phone_number,
      address,
      linkedin_link,
      gender,
      date_of_birth,
      rating,
      raters,
      approved,
      tags, // Added tags to the request body
    } = req.body;

    // Required fields validation
    if (
      !firebase_uid ||
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !role
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Base fields
    const fields = [
      "firebase_uid",
      "username",
      "first_name",
      "last_name",
      "email",
      "role",
    ];
    const values = [firebase_uid, username, first_name, last_name, email, role];

    // Optional fields (only push if they exist)
    if (phone_number) {
      fields.push("phone_number");
      values.push(phone_number);
    }
    if (address) {
      fields.push("address");
      values.push(address);
    }
    if (linkedin_link) {
      fields.push("linkedin_link");
      values.push(linkedin_link);
    }
    if (gender) {
      fields.push("gender");
      values.push(gender);
    }
    if (date_of_birth) {
      fields.push("date_of_birth");
      values.push(date_of_birth);
    }
    if (rating !== undefined) {
      fields.push("rating");
      values.push(rating);
    }
    if (raters !== undefined) {
      fields.push("raters");
      values.push(raters);
    }
    if (approved !== undefined) {
      fields.push("approved");
      values.push(approved);
    }

    // Build query
    const placeholders = fields.map(() => "?").join(", ");
    const sql = `INSERT INTO users (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;

    // Insert the user into the 'users' table
    const [result] = await require("../config/db").query(sql, values);

    // Insert the tags for the user into the 'user_tags' table
    if (tags && tags.length > 0) {
      const tagValues = tags.map((tagId) => [result.insertId, tagId]); // Map tag IDs to user ID
      const tagSql = "INSERT INTO user_tags (user_id, tag_id) VALUES ?";
      await require("../config/db").query(tagSql, [tagValues]);
    }

    res.status(201).json({
      message: "User created successfully.",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { firebase_uid } = req.body;

    if (!firebase_uid) {
      return res.status(400).json({ message: "firebase_uid is required." });
    }

    const userRole = await User.getByUid(firebase_uid);

    if (!userRole) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ role: userRole.role, username: userRole.username });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
