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
};

module.exports = examController;
