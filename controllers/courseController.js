const Course = require('../models/CourseModel');
const Grade = require('../models/GradeModel');
const Lesson = require('../models/LessonModel');
const mongoose = require('mongoose');
const XLSX = require('xlsx');

const isCodeExist = async (code, id, forLesson) => {
    if (forLesson) {
        const lesson = await Lesson.findOne({
            _id: id,
            "codes.code": code
        });
        return lesson !== null;
    } else {
        const course = await Course.findOne({
            _id: id,
            "codes.code": code
        });
        return course !== null;
    }
};

const addCourse = async (req, res) => {
    try {
        const courses = req.body
        console.log("courses: ", courses)
        if (!courses) {
            throw Error('يجب إدخال الكورسات')
        }
        console.log("Passed courses check")
        const coursesArray = []
        for (let course of courses) {
            const grade = await Grade.findOne({ name: course.grade })
            if (!grade) {
                throw Error('الصف الدراسي غير موجود')
            }
            coursesArray.push({ name: course.name, grade: grade._id, imgURL: course.imgURL, price: course.price })
        }
        const createdCourses = await Course.insertMany(coursesArray)
        console.log("createdCourses: ", createdCourses)
        res.status(200).json({ message: 'تمت إضافة الكورسات بنجاح', courses: createdCourses })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('grade')
        if (!courses) {
            throw Error('لا يوجد كورسات')
        }
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            throw Error('الكورس غير موجود')
        }
        await course.remove()
        res.status(200).json({ message: 'تم حذف الكورس بنجاح' })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const updateCourse = async (req, res) => {
    try {
        const { name, gradeName } = req.body
        const { id } = req.params
        if (!name && !gradeName) {
            throw Error('يجب إدخال جميع البيانات')
        }
        const grade = await Grade.findOne({ name: gradeName })
        if (gradeName && !grade) {
            throw Error('الصف الدراسي غير موجود')
        }
        const course = await Course.findById(id)
        if (!course) {
            throw Error('الكورس غير موجود')
        }
        name ? course.name = name : null
        gradeName ? course.grade = grade._id : null
        await course.save()
        res.status(200).json(course)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getCoursesByGrade = async (req, res) => {
    try {
        const { grade_id } = req.params
        console.log("grade_id: ", grade_id)
        const courses = await Course.find({ grade: grade_id }).populate('grade')
        if (!courses) {
            throw Error('لا يوجد كورسات')
        }
        console.log("courses: ", courses)
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}
const getCoursesByGradeName = async (req, res) => {
    try {
        const { gradeName } = req.body;
        const grade = await Grade.findOne({ name: gradeName });
        const courses = await Course.find({ grade: grade._id })
        if (!courses) {
            throw Error('لا يوجد كورسات')
        }
        console.log("courses: ", courses)
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}

const getCourseById = async (req, res) => {
    console.log(req.useragent.browser)
    if (req.useragent && req.useragent.browser !== 'Chrome') {
        console.log("Browser should be Safari ")
        return res.status(403).send(`
            <html>
                <body style="
                    margin: 0;
                    padding: 0;
                    font-family: 'Arial', sans-serif;
                    background-color: #f8f9fa;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                ">
                    <div style="
                        background-color: #ffffff;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        max-width: 500px;
                        width: 100%;
                    ">
                        <h1 style="
                            font-size: 2.5rem;
                            color: #dc3545;
                            margin-bottom: 20px;
                        ">
                            Access Denied
                        </h1>
                        <p style="
                            font-size: 1.2rem;
                            color: #6c757d;
                            line-height: 1.6;
                            margin-bottom: 30px;
                        ">
                            فيديوهاتنا تعمل فقط على متصفح Chrome. يرجى تحميله والعودة للموقع.
                        </p>
                        <a href="https://www.google.com/chrome/" target="_blank" style="
                            background-color: #007bff;
                            color: #ffffff;
                            padding: 12px 24px;
                            border-radius: 5px;
                            text-decoration: none;
                            font-size: 1rem;
                            transition: background-color 0.3s ease;
                        " onMouseOver="this.style.backgroundColor='#0056b3'" onMouseOut="this.style.backgroundColor='#007bff'">
                            Download Chrome
                        </a>
                    </div>
                </body>
            </html>
        `);
    }
    console.log("req.useragent: ", req.useragent)
    try {
        console.log("req.params.courseId: ", req.params.courseId)
        const course = await Course.findById(req.params.courseId).populate('grade')
        if (!course) {
            throw Error('الكورس غير موجود')
        }
        res.status(200).json(course)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}

const deleteAllCourses = async (req, res) => {
    try {
        await Course.deleteMany()
        res.status(200).json({ message: 'تم حذف جميع الكورسات بنجاح' })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const generateCodes = async (req, res) => {
    try {
        const { numberOfCodes, courseId, lessonId } = req.body;
        console.log("lesson id in generating codes: ", lessonId)
        const forLesson = lessonId ? true : false;
        const codePromises = Array.from({ length: numberOfCodes }, async () => {
            let newCode;
            const id = lessonId ? lessonId : courseId;
            do {
                newCode = (Math.random() + 1).toString(36).substring(7);
            } while (await isCodeExist(newCode, id, forLesson));
            return newCode;
        });
        const generatedCodes = await Promise.all(codePromises);
        const bulkOperations = generatedCodes.map(code => ({
            updateOne: {
            filter: { _id: forLesson ? lessonId : courseId },
            update: { $push: { codes: { code } } }
            }
        }));

        if (forLesson) {
            await Lesson.bulkWrite(bulkOperations);
        } else {
            await Course.bulkWrite(bulkOperations);
        }
        res.status(200).json(generatedCodes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};


const getCodes = async (req, res) => {
    const { courseId, codeStatus, lessonId } = req.body;
    try {
        console.log(courseId, codeStatus, lessonId)
        const forLesson = lessonId ? true : false;
        const id = lessonId ? lessonId : courseId;
        const model = forLesson ? Lesson : Course;
        const result = await model.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
            $project: {
                codes: {
                $filter: {
                    input: "$codes",
                    as: "code",
                    cond: { $eq: ["$$code.status", codeStatus] }
                }
                }
            }
            }
        ]);

        if (result.length === 0) {
            throw new Error('هذا الكورس/الدرس غير موجود');
        }

        res.status(200).json(result[0].codes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};


const getExcelCodes = async (req, res) => {
    const { courseId, codeStatus, selectedGradeName, lessonId } = req.body;
    try {
        let codes = [];
        console.log(courseId, codeStatus, selectedGradeName, lessonId)
        const forLesson = lessonId ? true : false;
        const id = lessonId ? lessonId : courseId;
        const objectId = new mongoose.Types.ObjectId(forLesson? lessonId : courseId);
        if (codeStatus == "تم الاستخدام" || codeStatus == "تم البيع") {
            const result = await (forLesson ? Lesson : Course).aggregate([
            { $match: { _id: objectId } },
            {
                $project: {
                codes: {
                    $filter: {
                    input: "$codes",
                    as: "code",
                    cond: { $eq: ["$$code.status", codeStatus] }
                    }
                }
                }
            }
            ]);
            if (result.length === 0) {
            throw new Error(forLesson ? 'هذا الدرس غير موجود' : 'هذا الكورس غير موجود');
            }
            codes = result[0].codes;
        }
        else if (codeStatus == "متاح") {
            const updatedDocument = await (forLesson ? Lesson : Course).findOneAndUpdate(
            { _id: objectId },
            { $set: { "codes.$[elem].status": "تم البيع" } },
            {
                arrayFilters: [{ "elem.status": codeStatus }],
                new: true
            }
            );

            if (!updatedDocument) {
                throw new Error(forLesson ? 'هذا الدرس غير موجود' : 'هذا الكورس غير موجود');
            }
            codes = updatedDocument.codes.filter(code => code.status === "تم البيع");
        }

        const workbook = XLSX.utils.book_new()
        const worksheetData = codes.map(c => ({
            'الكود': c.code,
            'الصف': selectedGradeName
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Codes');
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', 'attachment; filename="codes.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};

module.exports = {
    addCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCoursesByGrade,
    deleteAllCourses,
    getCoursesByGradeName,
    getCourseById,
    generateCodes,
    getCodes,
    getExcelCodes
}