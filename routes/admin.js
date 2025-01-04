const express = require('express');

const { addAdmin, getAllUsers, getUser, forgetPassword, otpVerification, resetPassword, numOfStudents, getImgUploadKey, getStudents } = require('../controllers/userController');
const {addGrade, editGrade, deleteGrade, getGrades} = require('../controllers/gradeController')
const {
    addCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCoursesByGrade,
    deleteAllCourses,
    getCoursesByGradeName,
    generateCodes,
    getCodes,
    getExcelCodes
    } = require('../controllers/courseController')
const {addLesson, getLessons, getLesson, deleteLesson, deleteAllLessons, latestWeekInCourse, addVideo, getLessonsByCourse} = require('../controllers/lessonController')
const { addQuiz, getQuizzesByCourse, getQuizByLesson, deleteQuiz, deleteAllQuizzes, addQuestionToQuiz, deleteQuizQuestion, editQuizQuestion } = require('../controllers/quizController');
// const { addExam, getExamsByModule, getExamByMonth, deleteExam, deleteAllExams, addQuestionToExam, editQuestion, deleteQuestion } = require('../controllers/examController');
// const {getPackages, netProfit, addPackage} = require('../controllers/packageController');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();
router.use(adminAuth);

router.post('/addadmin', addAdmin);
router.get('/imguploadkey', getImgUploadKey)
router.get('/allusers', getAllUsers);
router.get('/students', getStudents)
router.get('/getuser/:id', getUser);
router.post('/forgetpassword', forgetPassword);
router.post('/otpverification', otpVerification);
router.post('/resetpassword', resetPassword);
router.get('/numofstudents', numOfStudents);

router.get('/grades', getGrades);
router.post('/addgrade', addGrade);
router.put('/editgrade/:id', editGrade);
router.delete('/deletegrade/:id', deleteGrade);

router.post('/addcourse', addCourse);
router.get('/courses', getCourses);
router.delete('/deletecourse/:id', deleteCourse);
router.put('/updatecourse/:id', updateCourse);
router.delete('/deleteallcourses', deleteAllCourses);
router.get('/coursesbygrade/:grade_id', getCoursesByGrade);
router.post('/coursesbygradename', getCoursesByGradeName);
router.post('/generatecodes', generateCodes)
router.post('/getcodes', getCodes)
router.post('/excelCodes', getExcelCodes)


router.post('/addlesson', addLesson);
router.get('/lessons', getLessons);
router.get('/lessonsbycourse/:courseId', getLessonsByCourse)
router.get('/lesson/:id', getLesson);
router.delete('/deletelesson/:id', deleteLesson);
router.delete('/deletealllessons', deleteAllLessons);
router.post('/latestweekincourse', latestWeekInCourse);
router.put('/addvideo', addVideo)

router.post('/addquiz', addQuiz);
router.get('/quizzes/:course_id', getQuizzesByCourse);
router.get('/quiz/:lesson_id', getQuizByLesson);
router.delete('/deletequiz/:lesson_id', deleteQuiz);
router.delete('/deleteallquizzes', deleteAllQuizzes);
router.post('/addquestiontoquiz/:lesson_id', addQuestionToQuiz);
router.put('/editquizquestion/:id', editQuizQuestion);
router.delete('/deletequizquestion/:id', deleteQuizQuestion);

// router.post('/addexam', addExam);
// router.get('/exams/:module_id', getExamsByModule);
// router.get('/exam/:month', getExamByMonth);
// router.delete('/deleteexam/:id', deleteExam);
// router.delete('/deleteallexams', deleteAllExams);
// router.post('/addquestiontoexam/:id', addQuestionToExam);
// router.put('/editquestion/:id', editQuestion);
// router.delete('/deletequestion/:id', deleteQuestion);

// router.get('/packages', getPackages);
// router.get('/netprofit', netProfit);
// router.post('/addpackage', addPackage);




module.exports = router;