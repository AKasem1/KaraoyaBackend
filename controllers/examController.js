const Exam = require('../models/ExamModel');
const Course = require('../models/CourseModel');

const addExam = async (req, res) => {
    const { month, course_id, full_mark } = req.body;
    try {
        const course = await Course.findById(course_id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const exam = new Exam({ month, course_id, full_mark });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getExamsByModule = async (req, res) => {
    try {
        const course_id = req.params.course_id;
        const course = await Course.findById(course_id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const exams = await Exam.find({ course_id });
        res.status(200).json(exams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getExamByMonth = async (req, res) => {
    try {
        const month = req.params.month;
        const exam = await Exam.findOne({ month });
        if (!exam) return res.status(404).json({ message: 'لا يوجد امتحان' });
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteExam = async (req, res) => {
    try {
        const id = req.params.id;
        const exam = await Exam.findOneAndDelete({ _id: id });
        res.status(200).json({ message: 'تم حذف الامتحان بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteAllExams = async (req, res) => {
    try {
        await Exam.deleteMany({});
        res.status(200).json({ message: 'تم حذف جميع الامتحانات بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addQuestionToExam = async (req, res) => {
    try {
        const id = req.params.id;
        const exam = await Exam.findOne({ _id: id });
        const { question, answers, correctAnswer } = req.body;
        if (!question || !answers || !correctAnswer) {
            return res.status(400).json({ message: 'يجب ادخال السؤال و الاجابات' });
        }
        if (answers.includes(correctAnswer) === false) {
            return res.status(400).json({ message: 'الاجابة الصحيحة غير موجودة' });
        }
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        let sortValue = 1;
        if (exam.questions.length > 0) {
            const highestSortValue = Math.max(...exam.questions.map(q => q.sort));
            sortValue = highestSortValue + 1;
        }
        const newQuestion = { sort: sortValue, question, answers, correctAnswer };
        exam.questions.push(newQuestion);
        await exam.save();

        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const editQuestion = async (req, res) => {
    try {
        const id = req.params.id; 
        const { sort, question, answers, correctAnswer } = req.body;
        if (!sort || !question || !answers || !correctAnswer) {
            return res.status(400).json({ message: 'يجب ادخال السؤال و الاجابات و ترتيب السؤال' });
        }
        if (!Array.isArray(answers) || !answers.includes(correctAnswer)) {
            return res.status(400).json({ message: 'الاجابة الصحيحة غير موجودة' });
        }
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'هذا الامتحان غير موجود' });
        }
        const questionIndex = exam.questions.findIndex(q => q.sort === sort);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'هذا السؤال غير موجود' });
        }
        exam.questions[questionIndex].question = question;
        exam.questions[questionIndex].answers = answers;
        exam.questions[questionIndex].correctAnswer = correctAnswer;
        await exam.save();
        res.status(200).json({ message: 'تم تعديل السؤال بنجاح', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { sort } = req.body;
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'هذا الامتحان غير موجود' });
        }
        const questionIndex = exam.questions.findIndex(q => q.sort === sort);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'هذا السؤال غير موجود' });
        }
        exam.questions.splice(questionIndex, 1);
        
        for (let i = 0; i < exam.questions.length; i++) {
            exam.questions[i].sort = i + 1;
        }
        
        await exam.save();
        res.status(200).json({ message: 'تم حذف السؤال بنجاح', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addExam, getExamsByModule, getExamByMonth, deleteExam, deleteAllExams, addQuestionToExam, editQuestion, deleteQuestion };