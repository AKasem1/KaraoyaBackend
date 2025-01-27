const express = require('express');
const userAuth = require('../middlewares/userAuth')
const { signup, login, editProfile, getWatchingDetails, forgetPassword, otpVerification, resetPassword, logout, activityHandler, addMoneyToWallet, getWalletHistory } = require('../controllers/userController');
const { getGrades } = require('../controllers/gradeController');
const { getCoursesByGrade, getCourseById } = require('../controllers/courseController');
const { getCompletedLessons, getLessonsByCourse, updateWatchDuration} = require('../controllers/lessonController')
const { subscribeCourse, submitCode, deleteSubscription, getMyCourses, getMySubscriptions, getMyBills } = require('../controllers/subscriptionController');
const { getQuizByLesson, submitQuiz } = require('../controllers/quizController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgetpassword', forgetPassword);
router.post('/otpverification', otpVerification);
router.post('/resetpassword', resetPassword);
router.get('/grades', getGrades);
router.get('/coursesbygrade/:grade_id', getCoursesByGrade);

router.use(userAuth);
router.put('/editprofile/:id', editProfile)
router.get('/user-activity/:userId', activityHandler)
router.get('/coursebyid/:courseId', getCourseById);

router.post('/subscribe/:courseId', subscribeCourse)
router.get('/mycourses/:userId', getMyCourses)
router.post('/submitcode/:userId', submitCode)
router.get('/mysubscriptions/:userId', getMySubscriptions)
router.get('/mybills/:userId', getMyBills)
router.post('/addMoneyToWallet/:userId', addMoneyToWallet)
router.get('/walletHistory/:userId', getWalletHistory)

router.get('/lessonsbycourse/:courseId', getLessonsByCourse)
router.get('/completedlessons', getCompletedLessons);
router.post('/updateWatchDuration', updateWatchDuration)
router.get('/watching-details/:userId', getWatchingDetails);

router.get('/getQuizByLesson/:lesson_id', getQuizByLesson)
router.post('/submitQuiz', submitQuiz);

module.exports = router;