const Subscription = require('../models/SubscriptionModel');
const Course = require('../models/CourseModel');
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


module.exports = {subscribeCourse, deleteSubscription, getMyCourses}
