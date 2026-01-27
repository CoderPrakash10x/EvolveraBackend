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

// Middleware

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://evolvera-frontend-f9xr.vercel.app",
      "https://evolvera-frontend-f9xr-b0oia9czg-prakashs-projects-e9516495.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 🔥 VERY IMPORTANT (preflight fix)
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Evolvera Backend Running 🚀");
});

// ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRegistrationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
