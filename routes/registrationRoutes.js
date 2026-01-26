const express = require("express");
const router = express.Router();

const {
  createRegistration
} = require("../controllers/registrationController");

router.post("/", createRegistration);

module.exports = router;
