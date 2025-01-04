const mongoose = require('mongoose');
const { Schema } = mongoose;

const codeSchema = new Schema({
    code: { 
        type: String, 
        default: ""
    },
    status: {
        type: String,
        enum: ['متاح', 'تم البيع', 'تم الاستخدام'],
        default: 'متاح'
    },
    created_at: { type: Date, default: Date.now }
});

const courseSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    grade: { 
        type: Schema.Types.ObjectId, 
        ref: 'Grade', 
        required: true 
    },
    enrolledCount: { 
        type: Number, 
        default: 0 
    },
    imgURL: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    numOfLessons: {
        type: Number,
        default: 0
    },
    numOfVideos: {
        type: Number,
        default: 0
    },
    numOfQuizzes :{
        type: Number,
        default: 0
    },
    codes: [codeSchema]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
