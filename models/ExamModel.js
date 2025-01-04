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
    image: {
        type: String,
        required: false
    },
    correctAnswer: { 
        type: String, 
        required: true 
    }
}, { _id: false });

const examSchema = new Schema({
    course_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    studentMarks: [studentMarksSchema],
    questions: {
        type: [questionsSchema],
    }, 
    month: {
        type: String,
        enum: [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ],
        required: true
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

examSchema.virtual('averageMarks').get(function () {
    if (this.studentMarks.length === 0) return 0;
    const totalMarks = this.studentMarks.reduce((acc, curr) => acc + curr.mark, 0);
    return totalMarks / this.studentMarks.length;
});

examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
