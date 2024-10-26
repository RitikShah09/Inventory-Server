const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");

dotenv.config();

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials to be included
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/inventory", inventoryRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
