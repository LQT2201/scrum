const ExamRecord = require("../models/exam-record.model");
const Exam = require("../models/exam.model");

const examRecordController = {
  joinExam: async (req, res, next) => {
    try {
      const { code: examCode } = req.params;
      const user = req.user;
      console.log(req.user)
      if (!examCode) {
        return res.status(400).json({ message: "Missing required data." });
      }
      
      // Find the exam by the exam code
      const existingExam = await Exam.findOne({ passcode: examCode });
      
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }
      
      console.log(user._id)

      // Check if the user has an existing exam record
      let existingExamRecord = await ExamRecord.findOne({
        examId: existingExam._id,
        "records.userId": user._id,
      });
  
      if (existingExamRecord) {
        // If the user already has an exam record, check their attempts
        const userRecord = existingExamRecord.records.find(
          (record) => record.userId.toString() === user._id.toString()
        );
  
        const currentAttempts = userRecord.attempts.length;
  
        // Check if the user has exhausted their allowed attempts
        if (currentAttempts >= existingExam.attempts) {
          return res
            .status(403)
            .json({ message: "You have no remaining attempts for this exam." });
        }
  
        // If the user has remaining attempts, add a new attempt
        const attemptNumber = currentAttempts + 1;
  
        userRecord.attempts.push({
          attemptNumber,
          results: [],
        });
  
        await existingExamRecord.save();
      } else {
        // If the user doesn't have an exam record, create a new record with the first attempt
        const records = [
          {
            userId: user._id,
            attempts: [
              {
                attemptNumber: 1,
                results: [],
              },
            ],
          },
        ];
  
        const newExamRecord = new ExamRecord({
          examId: existingExam._id,
          records,
        });
  
        await newExamRecord.save();
      }
  
      return res
        .status(200)
        .json({ message: `User ${user.studentId} joined exam ${examCode}.` });
    } catch (error) {
      next(error);
    }
  },
  
  saveExamSelections: async (req, res, next) => {
    try {
      const { answers } = req.body; // Expecting an array of answers with questionId and selectedOptions
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: "Missing or invalid data." });
      }
  
      const { code: examCode } = req.params;
      const user = req.user;
  
      // Find the exam by its code
      const existingExam = await Exam.findOne({ code: examCode });
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }
  
      // Find the exam record for this exam and user
      const existingExamRecord = await ExamRecord.findOne({
        examId: existingExam._id,
        "records.userId": user._id,
      });
  
      if (!existingExamRecord) {
        return res.status(404).json({ message: "User has not joined this exam." });
      }
  
      // Get the user's record within the exam
      const userRecord = existingExamRecord.records.find(
        (record) => record.userId.toString() === user._id.toString()
      );
  
      if (!userRecord) {
        return res.status(404).json({ message: "User's exam record not found." });
      }
  
      // Process each answer (questionId and selectedOptions)
      answers.forEach(({ questionId, selectedOptions }) => {
        if (!questionId || !selectedOptions || !Array.isArray(selectedOptions)) {
          return res.status(400).json({ message: "Invalid data for one of the answers." });
        }
  
        // Find the existing result for the question, if any
        const existingResult = userRecord.results.find(
          (result) => result.questionId.toString() === questionId.toString()
        );
  
        if (existingResult) {
          // Update the selected options if the question was already answered
          existingResult.selectedOptions = selectedOptions;
        } else {
          // Add new result for the question
          userRecord.results.push({
            questionId,
            selectedOptions,
          });
        }
      });
  
      // Save the updated exam record
      await existingExamRecord.save();
  
      return res.status(200).json({ message: "Selections saved successfully." });
    } catch (error) {
      next(error);
    }
  },
  
  getExamRecordByExamCode: async (req, res, next) => {
    try {
      const { code: examCode } = req.params;
      const { role, _id: userId } = req.user; // Extract the user's ID from the request

      // Find the exam by its code
      const existingExam = await Exam.findOne({ code: examCode });
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      // Calculate the total score for the exam
      const totalScore = existingExam.totalScore;

      if (role === "Teacher".toUpperCase()) {
        // Fetch all student records for this exam
        const examRecords = await ExamRecord.find({
          examId: existingExam._id,
        }).populate({
          path: "records.userId",
          select: "name email studentId",
        });

        if (!examRecords || examRecords.length === 0) {
          return res.status(404).json({ message: "No exam records found." });
        }

        // Calculate scores for all students and return exam details
        const studentScores = examRecords.map((record) => {
          const score = record.records.reduce((totalScore, userRecord) => {
            const userScore = userRecord.results.reduce((sum, result) => {
              const question = existingExam.questions.find(
                (q) => q._id.toString() === result.questionId.toString()
              );

              if (!question) return sum;

              // Check if the selected options match the correct ones
              const correctOptions = question.options
                .filter((opt) => opt.isCorrect)
                .map((opt) => opt._id.toString());
              const selectedOptions = result.selectedOptionIds.map((optId) =>
                optId.toString()
              );

              // Add points if selected options match
              if (
                selectedOptions.length === correctOptions.length &&
                correctOptions.every((opt) => selectedOptions.includes(opt))
              ) {
                return sum + question.point;
              }

              return sum;
            }, 0);

            return totalScore + userScore;
          }, 0);

          return {
            student: record.records[0].userId, // Assuming one record per user
            score,
          };
        });

        return res.status(200).json({
          exam: existingExam, // Include the exam details
          totalScore,
          students: studentScores, // Include scores for each student
          records: examRecords, // Include exam records
        });
      } else if (role === "Student".toUpperCase()) {
        // Fetch the logged-in student's record
        const studentRecord = await ExamRecord.findOne({
          examId: existingExam._id,
          "records.userId": userId, // Only fetch the student's record
        }).populate({
          path: "records.userId",
          select: "name email studentId",
        });

        if (!studentRecord) {
          return res
            .status(404)
            .json({ message: "No record found for this student." });
        }

        // Calculate the student's score
        const score = studentRecord.records[0].results.reduce((sum, result) => {
          const question = existingExam.questions.find(
            (q) => q._id.toString() === result.questionId.toString()
          );

          if (!question) return sum;

          const correctOptions = question.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt._id.toString());
          const selectedOptions = result.selectedOptionIds.map((optId) =>
            optId.toString()
          );

          if (
            selectedOptions.length === correctOptions.length &&
            correctOptions.every((opt) => selectedOptions.includes(opt))
          ) {
            return sum + question.point;
          }

          return sum;
        }, 0);

        return res.status(200).json({
          exam: existingExam, // Include the exam details
          student: studentRecord.records[0].userId, // Include student info
          score, // Include the calculated score
          totalScore,
          record: studentRecord, // Include the student's exam record
        });
      } else {
        return res.status(403).json({ message: "Unauthorized access." });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examRecordController;
