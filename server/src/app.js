const express = require("express");
const tagRoutes = require("./routes/tag.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/errorHandler");
const verifyToken = require("./middlewares/verifyToken");
const cors = require("cors");

const app = express();

// Enable CORS for frontend at 5173
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if you're sending cookies or authorization headers
  })
);

app.use(express.json());

//Routes
app.use("/api/tags", tagRoutes);
app.use("/api/auth", verifyToken, authRoutes);

// Error handling middleware
app.use(errorHandler);

app.options("*", cors()); // handles preflight requests

module.exports = app;
