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
    score: { 
        type: Number, 
        required: true 
    },
    solvedQuizzes: {
        type: Number,
        required: true
    },
});

const walletSchema = new Schema({
    balance: { 
        type: Number, 
        default: 0.00 
    },
    history: [
        {
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
            type: { type: String, enum: ['سحب', 'دفع', 'إضافة'], required: true },
        }],
    created_at: { type: Date, default: Date.now }
});

const sessionSchema = new Schema({
    device: { 
        type: String, 
        default: 'Unknown' 
    },
    operatingSystem: { 
        type: String, 
        required: true 
    },
    browser: { 
        type: String, 
        required: true 
    },
    lastActive: { 
        type: Date, 
        default: Date.now 
    },
    loginTime: { 
        type: Date, 
        default: Date.now 
    },
    logoutTime: { 
        type: Date 
    },
});

const activitySchema = new Schema({
    date: { 
        type: Date, 
        default: Date.now 
    },
    type: { 
        type: String, 
        enum: ['login', 'logout', 'signup'], 
        required: true 
    },
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
    grade: { 
        type: Schema.Types.ObjectId, 
        ref: 'Grade', 
        // required: true 
    },
    paymentMethod: [paymentMethodSchema],
    evaluations: [evaluationSchema],
    wallet: walletSchema,
    sessions: [sessionSchema],
    activities: [activitySchema],
    watchingDetails: [
        {
            lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
            watchDuration: { type: Number, required: true },
            watchTime: { type: Date, required: true },
        },
    ],
    bills:[{
        course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        price: { type: Schema.Types.Decimal128, required: true },
        paid: { type: Boolean, default: false },
        created_at: { type: Date, default: Date.now }
    }],
    created_at: { 
        type: Date, 
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
