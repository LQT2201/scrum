const ExamModel = require("../models/exam.model");

const examController = {
  // Create a new exam
  createExam: async (req, res, next) => {
    try {
      const { authorIds, questions, startDay, endDay, duration, examName, attempts, description } = req.body;

      // Validate required data
      if (!authorIds || !questions || !startDay || !endDay || !duration) {
        return res.status(400).json({ message: "Missing required data." });
      }
      
      // Create new exam

      const generateExamCode = () => {
        const prefix = "EXAM"; // Prefix for the exam code
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
        return `${prefix}${randomNum}`;
      };


      const code = generateExamCode()

      const newExam = new ExamModel({
        code,
        authorIds,
        questions,
        startDay,
        endDay,
        duration,
        examName,
        attempts,
        description
      });

      console.log("asdf")

      // Save the exam to the database
      const savedExam = await newExam.save();


      return res
        .status(201)
        .json({ message: "Exam created successfully.", exam: savedExam });
    } catch (error) {
      next(error);
    }
  },

  // Get an exam by its code
  getExamByCode: async (req, res, next) => {
    try {
      const { code } = req.params;

      // Find exam by code
      const exam = await ExamModel.findOne({ code }).populate(
        "authorIds",
        "name email"
      );
      if (!exam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      return res.status(200).json({ exam });
    } catch (error) {
      next(error);
    }
  },

  authenticateStudentJoinExam: async (req, res, next) => {
    try {
      const { passcode } = req.body;

      // Validate input
      if (!passcode) {
        return res.status(400).json({ message: "Missing required data." });
      }


      // Check if exam exists with the given passcode
      const exam = await ExamModel.findOne({ passcode });
      if (!exam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      // Check if the exam time is still valid
      const currentTime = new Date();
      if (currentTime > exam.endDay) {
        return res.status(400).json({ message: "Exam time has expired." });
      }

      // All checks passed, respond with success
      return res.status(200).json({ exam });
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error);
    }
  },
};

module.exports = examController;
