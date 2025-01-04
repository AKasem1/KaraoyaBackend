const Quiz = require('../models/QuizModel');
const Lesson = require('../models/LessonModel');
const Course = require('../models/CourseModel');

const addQuiz = async (req, res) => {
    const { lesson_id, course_id, full_mark, questions } = req.body;
    try {
        console.log("Lesson ID: ", lesson_id);
        const lesson = await Lesson.findById(lesson_id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const course = await Course.findById(course_id);
        if (!course) return res.status(404).json({ message: 'course not found' });

        const quiz = new Quiz({ lesson_id, course_id, full_mark });
        if (!questions) {
            throw new Error('يجب إدخال الأسئلة');
        }
        for (let i = 0; i < questions.length; i++) {
            const { question, answers, correctAnswer, imgURL } = questions[i];
            if (!question || !answers || !correctAnswer) {
                throw new Error('يجب إدخال السؤال و الإجابات');
            }
            if (!Array.isArray(answers) || !answers.includes(correctAnswer)) {
                throw new Error('الإجابة الصحيحة يجب أن تكون من ضمن الإجابات');
            }
            quiz.questions.push({ sort: i + 1, question, answers, correctAnswer, imgURL });
        }
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getQuizzesByCourse = async (req, res) => {
    try {
        const course_id = req.params.course_id;
        const course = await Course.findById(course_id);
        if (!course) return res.status(404).json({ message: 'course not found' });
        const quizzes = await Quiz.find({ course_id });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getQuizByLesson = async (req, res) => {
    try {
        const lesson_id = req.params.lesson_id;
        const lesson = await Lesson.findById(lesson_id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        const quiz = await Quiz.findOne({ lesson_id });
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteQuiz = async (req, res) => {
    try {
        const lesson_id = req.params.lesson_id;
        const lesson = await Lesson.findById(lesson_id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        await Quiz.findOneAndDelete({ lesson_id });
        res.status(200).json({message: 'تم حذف الكويز بنجاح'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteAllQuizzes = async (req, res) => {
    try {
        await Quiz.deleteMany({});
        res.status(200).json({ message: 'تم حذف جميع الكويزات بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addQuestionToQuiz = async (req, res) => {
    try {
        const lesson_id = req.params.lesson_id;
        console.log(lesson_id);
        const { question, answers, correctAnswer, imgURL} = req.body;
        if (!question || !answers || !correctAnswer) return res.status(400).json({ message: 'يجب ادخال السؤال و الاجابات' });
        if (answers.includes(correctAnswer) === false) return res.status(400).json({ message: 'الاجابة الصحيحة يجب ان تكون من ضمن الاجابات' });
        let sortValue = 1;
        console.log("Question: ", req.body);
        const quiz = await Quiz.findById(lesson_id);
        console.log("quiz: ", quiz)
        if (!quiz) return res.status(404).json({ message: 'لا يوجد كويز' });
        if (quiz.questions.length > 0) {
            const highestSortValue = Math.max(...quiz.questions.map(q => q.sort));
            sortValue = highestSortValue + 1;
        }
        const questions = { sort: sortValue, question, answers, correctAnswer, imgURL };
        if (!quiz.questions) {
            quiz.questions = questions;
        }
        else {
            quiz.questions.push(questions);
        }
        await quiz.save();
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteQuizQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { sort } = req.body;
        if (sort === undefined) {
            return res.status(400).json({ message: 'يجب إدخال ترتيب السؤال' });
        }
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const questionIndex = quiz.questions.findIndex(q => q.sort === sort);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'Question not found' });
        }
        quiz.questions.splice(questionIndex, 1);
        for (let i = 0; i < quiz.questions.length; i++) {
            quiz.questions[i].sort = i + 1;
        }
        await quiz.save();
        res.status(200).json({ message: 'Question deleted successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editQuizQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const { sort, question, answers, correctAnswer } = req.body;
        if (!sort || !question || !answers || !correctAnswer) {
            return res.status(400).json({ message: 'يجب إدخال ترتيب السؤال و السؤال و الإجابات' });
        }
        if (!Array.isArray(answers) || !answers.includes(correctAnswer)) {
            return res.status(400).json({ message: 'الإجابة الصحيحة يجب أن تكون من ضمن الإجابات' });
        }
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'الكويز غير موجود' });
        }
        const questionIndex = quiz.questions.findIndex(q => q.sort === sort);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'هذا السؤال غير موجود' });
        }
        quiz.questions[questionIndex].question = question;
        quiz.questions[questionIndex].answers = answers;
        quiz.questions[questionIndex].correctAnswer = correctAnswer;
        await quiz.save();
        res.status(200).json({ message: 'تم تعديل السؤال بنجاح', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addQuiz, getQuizzesByCourse, getQuizByLesson, deleteQuiz, deleteAllQuizzes, addQuestionToQuiz, deleteQuizQuestion, editQuizQuestion };