const ExamModel = require("../models/exam.model");

const examController = {
  // Create a new exam
  createExam: async (req, res, next) => {
    try {
      const { authorIds, questions, startDay, endDay, duration, examName, attempts, description } = req.body;

      // Validate required data
      if (!authorIds || !Array.isArray(authorIds) || authorIds.length === 0 ||
          !questions || !Array.isArray(questions) || questions.length === 0 ||
          !startDay || !endDay || !duration) {
        return res.status(400).json({ message: "Missing required data." });
      }

      // Function to generate a unique exam passcode
      const generateExamCode = async () => {
        const prefix = "EXAM"; // Prefix for the exam code
        let code;
        let examExists = true;

        // Loop to ensure unique passcode
        while (examExists) {
          const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
          code = `${prefix}${randomNum}`;
          // Check if the passcode already exists
          const existingExam = await ExamModel.findOne({ passcode: code });
          examExists = !!existingExam; // Update the flag based on existence
        }
        console.log(code)
        return code;
      };

      const passcode = await generateExamCode(); // Generate a unique passcode

      // Create new exam
      const newExam = new ExamModel({
        passcode,
        authorIds,
        questions,
        startDay,
        endDay,
        duration,
        examName,
        attempts,
        description
      });

      // Save the exam to the database
      const savedExam = await newExam.save();

      return res
        .status(201)
        .json({ message: "Exam created successfully.", exam: savedExam });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ message: "Internal server error." });
    }
  },

  // Get an exam by its passcode
  getExamByCode: async (req, res, next) => {
    try {
      const { code } = req.params;

      // Find exam by passcode
      const exam = await ExamModel.findOne({ passcode: code }).populate(
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
};

module.exports = examController;
