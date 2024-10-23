const mongoose = require("mongoose");

const { Schema } = mongoose;

const generateExamCode = () => {
  const prefix = "EXAM"; // Prefix for the exam code
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `${prefix}${randomNum}`;
};

const optionSchema = new Schema({
  option: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
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
  options: [optionSchema],
});

const examSchema = new Schema(
  {
    code: {
      type: String,
      required: false,
      unique: true,
      index: true,
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

examSchema.pre("save", (next) => {
  if(!this.code){
    this.code = generateExamCode()
  } 
  return(next())
})

examSchema.virtual("totalScore").get(function () {
  return this.questions.reduce((sum, question) => sum + question.point, 0);
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
