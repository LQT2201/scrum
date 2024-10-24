const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const examRecordSchema = new Schema({
  examId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "Exam",
  },
  records: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      attempts: [
        {
          attemptNumber: {
            type: Number,
            required: true,
          },
          results: [
            {
              questionId: {
                type: Schema.Types.ObjectId,
                ref: "Exam.questions",
              },
              selectedOptionIds: [
                {
                  type: Schema.Types.ObjectId,
                  ref: "Exam.questions.options",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const ExamRecord = mongoose.model("ExamRecord", examRecordSchema);

module.exports = ExamRecord;
