const express = require("express");
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const logger = require("morgan");
const cors = require("cors");
const app = express();

require("dotenv").config({ path: "./.env" });

require("./models/db").connectDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);

app.use(cookieParser());
app.use(logger("tiny"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/inventory", inventoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
