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
const formRoutes = require("./routes/formRoutes");

const Registration = require("./models/Registration");
const FormSubmission = require("./models/FormSubmission");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("/{*path}", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/*
|--------------------------------------------------------------------------
| REMOVE REGISTRATION DUPLICATE RESTRICTIONS
|--------------------------------------------------------------------------
|
| Same person/email can register:
|
| Event A
| Event A again
| Event B
| Event C
|
| No "Already registered" restriction.
|
|--------------------------------------------------------------------------
*/

async function removeRegistrationUniqueIndexes() {
  try {
    /*
    |--------------------------------------------------------------------------
    | FORM SUBMISSIONS
    |--------------------------------------------------------------------------
    */

    const formCollection = FormSubmission.collection;

    const formIndexes = await formCollection.indexes();

    for (const index of formIndexes) {
      const keys = index.key || {};

      const isUniqueEmailIndex =
        index.unique === true &&
        (
          keys["responses.email"] === 1 ||
          index.name === "unique_email_per_event"
        );

      if (isUniqueEmailIndex) {
        try {
          await formCollection.dropIndex(index.name);

          console.log(
            `Removed registration restriction: ${index.name}`
          );
        } catch (error) {
          console.log(
            `Could not remove ${index.name}: ${error.message}`
          );
        }
      }
    }


    /*
    |--------------------------------------------------------------------------
    | NORMAL REGISTRATIONS
    |--------------------------------------------------------------------------
    */

    const registrationCollection =
      Registration.collection;

    const registrationIndexes =
      await registrationCollection.indexes();

    for (const index of registrationIndexes) {
      const keys = index.key || {};

      const isUniqueEmailIndex =
        index.unique === true &&
        (
          keys["teamLeader.email"] === 1 ||
          index.name === "unique_leader_per_event"
        );

      if (isUniqueEmailIndex) {
        try {
          await registrationCollection.dropIndex(
            index.name
          );

          console.log(
            `Removed registration restriction: ${index.name}`
          );
        } catch (error) {
          console.log(
            `Could not remove ${index.name}: ${error.message}`
          );
        }
      }
    }

    console.log(
      "✅ Duplicate registrations are ENABLED."
    );

  } catch (error) {
    console.error(
      "❌ Could not remove registration indexes:",
      error.message
    );
  }
}


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

connectDB()
  .then(async () => {
    await removeRegistrationUniqueIndexes();
  })
  .catch((error) => {
    console.error(
      "Database connection error:",
      error.message
    );
  });


/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("Evolvera Backend Running 🚀");
});


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminRoutes);

app.use(
  "/api/admin",
  adminRegistrationRoutes
);

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/registrations",
  registrationRoutes
);

app.use(
  "/api/gallery",
  galleryRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/forms",
  formRoutes
);


/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});