const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// 🔐 Auth
app.use("/api/auth", require("./routes/authRoutes"));

// 🔥 ADD THESE (VERY IMPORTANT)
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/units", require("./routes/unitRoutes"));
app.use("/api/lists", require("./routes/listRoutes"));

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});