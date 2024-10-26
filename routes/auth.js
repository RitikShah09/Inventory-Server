const express = require("express");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  const user = await User.findById(req.id).exec();
  res.json({ user: { id: user._id, email: user.email } });
});

module.exports = router;
