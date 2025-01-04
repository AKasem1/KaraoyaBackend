const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Lesson schema
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
    created_at: { type: Date, default: Date.now }
});

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
