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

const lessonSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    grade: {
        type: Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    course: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    video_url: { 
        type: String, 
        default: null
    },
    pdf_url: { 
        type: String, 
        default: null 
    },
    visible:{
        type: Boolean,
        default: true
    },
    codes: [codeSchema],
    created_at: { type: Date, default: Date.now }
});

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
