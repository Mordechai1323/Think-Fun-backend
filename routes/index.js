const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ err: "Api Work 200" });
});

module.exports = router;
