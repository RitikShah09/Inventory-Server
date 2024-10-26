const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.id = id;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;