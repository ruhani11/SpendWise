const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    console.log("🔐 AUTH HIT");

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secretkey");

    req.userId = decoded.id;

    console.log("👤 USER ID:", req.userId);

    next();
  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;