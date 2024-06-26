const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const authController = require("./auth.controller");
const { body, param } = require("express-validator");

//! public route for creating a new user
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("name").notEmpty().withMessage("name is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  authController.signup
);

//! public route for logging in
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  authController.login
);

//? private route for logging out
router.get(
  "/logout",
  authController.logout
);

//!! private route for getting current user's info
router.get(
  "/me",
  authController.protect,
  userController.getCurrentUser
);

//! public route for getting all users
router.get(
  "/mini",
  userController.getAllMiniUsers
);
//! private route for getting current user's info
router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
  ],
  userController.getUserbyId
);

router.patch(
  "/updateDraws/",
  [
    body("draws").notEmpty().withMessage("Draws is required"),
  ],
  authController.protect,
  userController.updateDrawsCurrentUser
);

router.post(
  "/updateNoteUsers/",
  [
    body("notes").notEmpty().withMessage("Notes is required"),
  ],
  userController.updateNoteUsers
);

//! private route for updating current user's info
router.patch(
  "/updateMe",
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("name").optional().notEmpty().withMessage("name is required"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  authController.protect,
  userController.updateCurrentUser
);

//! private route for deleting current user's account
router.delete(
  "/deleteMe",
  authController.protect,
  userController.deleteCurrentUser
);


//! admin route for getting all users
router.get(
  "/",
  userController.getAllUsers
);




//! admin route for updating user's info
router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("name").optional().notEmpty().withMessage("name is required"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUser
);

//! admin route for deleting user's account
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid user ID"),
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);

module.exports = router;
