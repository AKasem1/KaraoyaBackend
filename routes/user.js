const express = require('express');
const userAuth = require('../middlewares/userAuth')
const { signup, login, editProfile, forgetPassword, otpVerification, resetPassword } = require('../controllers/userController');
const { getGrades } = require('../controllers/gradeController');
const { getCoursesByGrade, getCourseById } = require('../controllers/courseController');
const { getCompletedLessons, getLessonsByCourse} = require('../controllers/lessonController')
const { subscribeCourse, submitCode, deleteSubscription, getMyCourses } = require('../controllers/subscriptionController')

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetpassword', forgetPassword);
router.post('/otpverification', otpVerification);
router.post('/resetpassword', resetPassword);
router.get('/grades', getGrades);
router.get('/coursesbygrade/:grade_id', getCoursesByGrade);

router.use(userAuth);
router.put('/editprofile/:id', editProfile)
router.get('/coursebyid/:courseId', getCourseById);

router.post('/subscribe/:courseId', subscribeCourse)
router.get('/mycourses/:userId', getMyCourses)
router.post('/submitcode/:userId', submitCode)

router.get('/lessonsbycourse/:courseId', getLessonsByCourse)
router.get('/completedlessons', getCompletedLessons);
module.exports = router;