const mongoose = require("mongoose");

const { Schema } = mongoose;

const optionSchema = new Schema({
  option: {
    type: String,
    required: true,
  },
});

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  point: {
    type: Number,
    required: true,
  },
  answer:{
    type:String,
    required:true
  },
  options: [optionSchema],
});

const examSchema = new Schema(
  {
    passcode: {
      type: String,
      required: true,
      unique: true,
    },
    authorIds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    questions: [questionSchema],
    startDay: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDay: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    examName: {
      type: String,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


examSchema.virtual("totalScore").get(function () {
  return this.questions.reduce((sum, question) => sum + question.point, 0);
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
