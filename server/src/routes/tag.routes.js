const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tag.controller");

router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);

module.exports = router;
