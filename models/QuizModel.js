const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentMarksSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    mark: { 
        type: Number, 
        required: true 
    }
}, { _id: false });

const questionsSchema = new Schema({
    sort: {
        type: Number,
        required: true
    },
    question: { 
        type: String, 
        required: true 
    },
    answers: { 
        type: [String], 
        required: true 
    },
    imgURL: {
        type: String,
        required: false
    },
    correctAnswer: { 
        type: String, 
        required: true 
    }
}, { _id: false });

const quizSchema = new Schema({
    lesson_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Lesson', 
        required: true 
    },
    course_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    studentMarks: [studentMarksSchema],
    questions: {
        type: [questionsSchema],
    },
    full_mark: { 
        type: Number, 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

quizSchema.virtual('averageMarks').get(function () {
    if (this.studentMarks.length === 0) return 0;
    const totalMarks = this.studentMarks.reduce((acc, curr) => acc + curr.mark, 0);
    return totalMarks / this.studentMarks.length;
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
