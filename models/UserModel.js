const mongoose = require('mongoose');
const { Schema } = mongoose;

const evaluationSchema = new Schema({
    course_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    month: {
        type: String,
        enum: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        required: true
    },
    quiz_grades: [
        {
            quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
            grade: { type: Number, required: true }
        }
    ],
    exam_grade: { 
        type: Schema.Types.Decimal128, 
        required: true 
    },
    completed_lessons: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Lesson' 
    }],
    score: { 
        type: Number, 
        required: true 
    }
});

const walletSchema = new Schema({
    balance: { 
        type: Schema.Types.Decimal128, 
        default: 0.00 
    },
    created_at: { type: Date, default: Date.now }
});

const paymentMethodSchema = new Schema({
    cardNumber: { 
        type: String, 
        required: true 
    },
    expiryDate: { 
        type: String, 
        required: true
    },
    cvc: { 
        type: String, 
        required: true }
});

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    anotherPhone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: { 
        type: String, 
        enum: ['student', 'admin'], 
        default: 'student'
    },
    paymentMethod: [paymentMethodSchema],
    evaluations: [evaluationSchema],
    wallet: [walletSchema],
    created_at: { 
        type: Date, 
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
