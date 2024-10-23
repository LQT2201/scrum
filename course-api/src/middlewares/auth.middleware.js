const jwtUtil = require("../utils/jwt.util");

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decodedToken = jwtUtil.verifyToken(token);
      req.user = decodedToken;

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Token verification failed" });
    }
  },

  controlRoleAccess: (roles) => {
    return async (req, res, next) => {
      try {
        const userRole = req.user.role;
        console.log("role", req)
        if (!roles.includes(userRole)) {
          return res.status(403).json({ message: "Access denied" });
        }
        next();
      } catch (error) {
        console.log(error);
        return res.status(403).json({ message: "Role control failed" });
      }
    };
  },
};

module.exports = authMiddleware;
