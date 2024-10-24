const User = require("../models/user.model");
const passwordHasher = require("../utils/password-hasher.util");
const jwtUtil = require("../utils/jwt.util");

const authController = {
  register: async (req, res, next) => {
    try {
      const { userId, name, email, password, avatar, birthday, role } = req.body;

      // Check for missing data
      if (!userId || !name || !email || !password) {
        return res.status(400).json({ message: "Missing required data." });
      }

      // Validate role
      const validRoles = ["Teacher", "Student"];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json("Role is not supported.");
      }

      // Check if user already exists (assuming email should be unique)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json("User with this email already exists.");
      }

      // Check if user already exists (assuming email should be unique)
      const existingUser2 = await User.findOne({ userId });
      if (existingUser2) {
        return res.status(400).json("User with this userId already exists.");
      }

      // Hash the password
      const hashedPassword = await passwordHasher.hashPassword(password);

      // Create new user
      const newUser = new User({
        userId,
        name,
        email,
        password: hashedPassword,
        avatar,
        birthday,
        role: role.toUpperCase(),
      });

      // Save the new user to the database
      await newUser.save();

      // Remove password from the response object
      const userResponse = {
        _id: newUser._id,
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        birthday: newUser.birthday,
        role: newUser.role
      };

      // Respond with success
      return res
        .status(201)
        .json({ message: "User registered successfully.", data: userResponse });
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { identifier, password } = req.body;

      // Validate input
      if (!identifier || !password) {
        return res.status(400).json({ message: "Missing required data." });
      }

      // Find user by userId or email
      const user = await User.findOne({
        $or: [{ userId: identifier }, { email: identifier }],
      });

      // If no user is found
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Compare passwords
      const isPasswordValid = await passwordHasher.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json("Invalid password.");
      }

      // Generate JWT token
      const token = jwtUtil.generateToken({
        _id: user._id,
        userId: user.userId,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const userResponse = {
        userId: user.userId,
        name: user.name,
        token,
        email: user.email,
        avatar: user.avatar,
        birthday: user.birthday
      };

      // Respond with token and user data
      return res.status(200).json({
        message: "Login successful.",
        // token, // Include the JWT token
        data: userResponse,
      });
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error);
    }
  },
};

module.exports = authController;
