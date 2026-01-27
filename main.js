require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const adminRoutes = require("./routes/adminRoutes");
const adminRegistrationRoutes = require("./routes/adminRegistrationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const contactRoutes = require("./routes/contactRoutes");

connectDB();

const app = express();

/* ================= 🔥 CORS (FIXED) ================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://evolvera-frontend-u8aw.vercel.app",
      "https://evolvera-frontend-u8aw-h3vdnxssj-prakashs-projects-e9516495.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 🔥 VERY IMPORTANT (preflight)
app.options("*", cors());

/* ================= BODY PARSER ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "Evolvera Backend Running 🚀" });
});

/* ================= ROUTES ================= */
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRegistrationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
