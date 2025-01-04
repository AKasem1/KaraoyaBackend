const Grade = require('../models/GradeModel');

const getGrades = async (req, res) => {
    try {
        const grades = await Grade.find()
        if(!grades){
            throw Error('لا يوجد صفوف دراسية')
        }
        res.status(200).json(grades)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const addGrade = async (req, res) => {
    try {
        const { name } = req.body
        if(!name){
            throw Error('يجب إدخال اسم الصف الدراسي')
        }
        console.log(req.body)
        const grade = new Grade({name})
        await grade.save()
        res.status(200).json({grade, message: 'تم إضافة الصف الدراسي بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send({message: error.message})
    }
}

const deleteGrade = async (req, res) => {
    try {
        const id = req.params.id
        if(!id){
            throw Error('يجب إدخال الصف الدراسي')
        }
        await Grade.findByIdAndDelete(id)
        res.status(200).json({message: 'تم حذف الصف الدراسي بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const editGrade = async (req, res) => {
    try {
        const { name } = req.body
        const { id } = req.params
        if(!name){
            throw Error('يجب إدخال اسم الصف الدراسي')
        }
        const grade = await Grade.findById(id)
        if(!grade){
            throw Error('الصف الدراسي غير موجود')
        }
        grade.name = name
        await grade.save()
        res.status(200).json({message: "تم تعديل الصف الدراسي بنجاح", grade})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

module.exports = {
    getGrades,
    addGrade,
    deleteGrade,
    editGrade
}