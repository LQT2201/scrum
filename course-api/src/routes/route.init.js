const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Example route
router.use("/auth", require("./auth.route"));
router.use("/exam", require("./exam.route"));
router.get(
  "/test",
  authMiddleware.verifyToken,
  authMiddleware.controlRoleAccess(["TEACHER", "STUDENT"]),
  (req, res, next) => {
    res.send("Hello form test");
  }
);

module.exports = router;
