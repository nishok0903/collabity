const Tag = require("../models/tag.model");

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.getAll();
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const id = await Tag.create({ name, color });
    res.status(201).json({ id, name, color });
  } catch (err) {
    next(err);
  }
};
