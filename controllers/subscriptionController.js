const Subscription = require('../models/SubscriptionModel');
const Course = require('../models/CourseModel');
const Lesson = require('../models/LessonModel');
const User = require('../models/UserModel');
const Payment = require('../models/PaymentModel');
const mongoose = require('mongoose');

const subscribeCourse = async (req, res) => {
    try {
        const {user_id, price, payment_method} = req.body;
        const {courseId} = req.params;
        const user = await User.findById(user_id)
        if(!user){
            throw Error('هذا المستخدم غير موجود');
        }
        const course = await Course.findById(courseId)
        if(!course){
            throw Error('هذا الكورس غير موجود')
        }
        if(course.price != price){
            throw Error('سعر الفاتورة غير متوافق مع سعر الكورس')
        }
        const subscription = await Subscription.findOne({user_id, course_id: courseId})
        if(subscription){
            throw Error('أنت مشترك في هذا الكورس بالفعل')
        }
        const payment = new Payment({user_id, course: courseId, amount: price})
        await payment.save();
        const newSubscription = new Subscription({user_id, course_id: courseId, price});
        await newSubscription.save();
        res.status(201).json({message: "تم الاشتراك في الكورس بنجاح"})
    }
    catch (error) {
        console.error('Error subscribing to course:', error);
        res.status(500).json({ message: 'Error subscribing to course' });
    }
}

const submitCode = async (req, res) => {
    try {
        const { userId } = req.params;
        const { code, codeType } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('هذا المستخدم غير موجود');
        }

        if (!codeType) {
            throw new Error('يجب اختيار نوع الكود');
        }

        let Model;
        let forLesson;
        if (codeType === 'lesson') {
            Model = Lesson;
            forLesson = true;
        } else if (codeType === 'course') {
            Model = Course;
            forLesson = false;
        } else {
            throw new Error('نوع الكود غير صحيح');
        }

        const result = await Model.aggregate([
            {
                $match: {
                    'codes.code': code, 
                },
            },
            {
                $project: {
                    _id: 1,
                    codes: {
                        $filter: {
                            input: '$codes',
                            as: 'code',
                            cond: {
                                $and: [
                                    { $eq: ['$$code.code', code] },
                                    { $eq: ['$$code.status', 'تم البيع'] },
                                ],
                            },
                        },
                    },
                },
            },
        ]);

        if (result.length === 0 || result[0].codes.length === 0) {
            throw new Error('الكود غير صحيح أو غير موجود أو لم يتم بيعه');
        }

        const foundCode = result[0].codes[0];
        const documentId = result[0]._id;

        let subscription;
        if (forLesson) {
            subscription = await Subscription.findOne({
                user_id: userId,
                lesson_id: documentId,
            });
            if (subscription) {
                throw new Error('أنت مشترك في هذه المحاضرة بالفعل');
            }
        }
        else {
            subscription = await Subscription.findOne({
                user_id: userId,
                course_id: documentId,
            });
            if (subscription) {
                throw new Error('أنت مشترك في هذا الكورس بالفعل');
            }
        }

        await Subscription.create({
            user_id: userId,
            lesson_id: forLesson ? documentId : null,
            course_id: forLesson ? null : documentId,
        });

        await Model.updateOne(
            { 'codes.code': code },
            { $set: { 'codes.$.status': 'تم الاستخدام' } }
        );

        res.status(200).json({
            message: 'تم تسجيل الكود بنجاح',
            code: foundCode,
            documentId: documentId,
        });
    } catch (error) {
        console.error('Error submitting code:', error);
        res.status(500).json({ message: error.message || 'حدث خطأ أثناء تسجيل الكود' });
    }
};

const deleteSubscription = async (req, res) => {
    console.log("Delete Subscription to a Course")
}

const getMyCourses = async (req, res) => {
    try {
        const { userId } = req.params; 
        console.log(userId)
        const courses = await Subscription.aggregate([
            { 
                $match: { user_id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course_id',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            {
                $unwind: '$courseDetails'
            },
            {
                $replaceRoot: { newRoot: '$courseDetails' }
            }
        ]);

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'أنت غير مشترك في أي كورسات' });
        }

        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
};


module.exports = {subscribeCourse, submitCode, deleteSubscription, getMyCourses}
