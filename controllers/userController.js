const User = require('../models/UserModel')
const Grade = require('../models/GradeModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const nodemailer = require('nodemailer')

let otpCode = 0

const createToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.SECRET, { expiresIn: '1d' })
}


const saveSession = async (userId, sessionData) => {
  const user = await User.findById(userId);
  const newSession = {
    device: sessionData.device || 'Unknown',
    operatingSystem: sessionData.operatingSystem,
    browser: sessionData.browser,
    lastActive: new Date(),
  };
  user.sessions.push(newSession);
  await user.save();
  return newSession;
};

const recordActivity = async (userId, activityType) => {
  const user = await User.findById(userId);
  const newActivity = {
    date: new Date(),
    type: activityType,
  };
  user.activities.push(newActivity);
  await user.save();
};

const getUserActivityData = async (userId) => {
  const user = await User.findById(userId).populate('activities');
  console.log('User:', user);
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayLogins = user.activities.filter(
    (activity) =>
      activity.type === 'login' &&
      new Date(activity.date).setHours(0, 0, 0, 0) === today
  );

  const weekLogins = user.activities.filter(
    (activity) =>
      activity.type === 'login' &&
      new Date(activity.date) >= weekAgo
  );

  return {
    todayLogins: todayLogins.length,
    weekLogins: weekLogins.length,
    recentSessions: user.sessions.slice(-10),
  };
};


const sendEmail = async ({ recipient_email, otpCode }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: 'منصة فيثاغورث - رمز OTP',
      html: `<!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>إعادة تعيين كلمة السر</title>
  </head>
  <body>
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">فيثاغورث</a>
      </div>
      <p style="font-size:1.1em">مرحباً،</p>
      <p>شكراً لاختيارك فيثاغورث. استخدم رمز التحقق التالي لإكمال عملية استعادة كلمة المرور. الرمز صالح لمدة 5 دقائق.</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otpCode}</h2>
      <p style="font-size:0.9em;">مع التحية،<br />فريق فيثاغورث</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>منصة فيثاغورث</p>
      </div>
    </div>
  </div>
  </body>
</html>
`,
    };

    console.log('Sending email...');

    await transporter.sendMail(mail_configs);
    return { message: 'Email sent successfully' };
  } catch (error) {
    console.log(error);
    throw { message: 'An error has occurred' };
  }
}

const addAdmin = async (req, res) => {
  const { name, email, password, confirmPassword, phone, anotherPhone, address } = req.body;
  try {
    if (!email || !password || !name || !phone || !anotherPhone || !address || !confirmPassword) {
      throw Error('All fields are required.');
    }
    if (!validator.isEmail(email)) {
      throw Error('البريد الإلكتروني غير صحيح');
    }
    if (!validator.isStrongPassword(password)) {
      throw Error('كلمة السر غير قوية');
    }
    if (password !== confirmPassword) {
      throw Error('كلمة المرور غير متطابقة');
    }
    const exists = await User.findOne({ email });
    if (exists) {
      throw Error('هذا البريد الإلكتروني مسجل بالفعل');
    }

    if (phone.length !== 11 || anotherPhone.length !== 11) {
      throw Error('رقم التليفون يجب أن يكون مكون من 11 رقم');
    }
    if (phone === anotherPhone) {
      throw Error('رقم التليفون الثاني يجب أن يكون مختلف عن رقم التليفون الأول');
    }
    const digitsRegex = /^\d+$/;
    console.log('Is phone valid:', digitsRegex.test(phone));
    console.log('Is parent phone valid:', digitsRegex.test(anotherPhone));
    if (!digitsRegex.test(phone) || !digitsRegex.test(anotherPhone)) {
      console.log('Phone numbers should consist of digits only.');
      return res.status(422).json({ error: 'رقم التليفون يجب أن يكون مكون من أرقام فقط' });
    }
    console.log('passed type of digits test');
    if (!phone.startsWith('01') || !anotherPhone.startsWith('01')) {
      console.log('يمكنك الحجز بأرقام مصرية فقط');
      return res.status(422).json({ error: 'يمكنك الحجز بأرقام مصرية فقط' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const admin = await User.create({
      name,
      email,
      password: hash,
      phone,
      anotherPhone,
      address,
      role: 'admin',
    });
    const token = createToken(admin._id);
    res.status(201).json({ admin, token, message: 'تم إضافة الأدمن بنجاح' });
  }
  catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
}

// Signup user
const signup = async (req, res) => {
  try {
    const { name, email, password, grade, confirmPassword, phone, anotherPhone, address } = req.body
    console.log("req.body:", { name, email, password, confirmPassword, phone, anotherPhone, address, grade })
    if (!email || !password || !name || !phone || !anotherPhone || !address || !confirmPassword || !grade) {
      throw Error('All fields are required.')
    }
    if (!validator.isEmail(email)) {
      throw Error("البريد الإلكتروني غير صحيح")
    }
    // if(!validator.isStrongPassword(password)){
    //   throw Error("كلمة السر غير قوية")
    // }
    if (password !== confirmPassword) {
      throw Error("كلمة المرور غير متطابقة")
    }
    const exists = await User.findOne({ email })
    if (exists) {
      throw Error("هذا البريد الإلكتروني مسجل بالفعل")
    }

    if (phone.length !== 11 || anotherPhone.length !== 11) {
      throw Error("رقم التليفون يجب أن يكون مكون من 11 رقم")
    }
    if (phone === anotherPhone) {
      throw Error("رقم التليفون الثاني يجب أن يكون مختلف عن رقم التليفون الأول")
    }

    const digitsRegex = /^\d+$/;
    console.log("Is phone valid:", digitsRegex.test(phone));
    console.log("Is parent phone valid:", digitsRegex.test(anotherPhone));
    if (!digitsRegex.test(phone) || !digitsRegex.test(anotherPhone)) {
      console.log("Phone numbers should consist of digits only.");
      return res
        .status(422)
        .json({ error: "رقم التليفون يجب أن يكون مكون من أرقام فقط" });
    }
    console.log("passed type of digits test");
    if (!phone.startsWith("01") || !anotherPhone.startsWith("01")) {
      console.log("يمكنك الحجز بأرقام مصرية فقط");
      return res
        .status(422)
        .json({ error: "يمكنك الحجز بأرقام مصرية فقط" });
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      anotherPhone,
      grade,
      address,
      role: 'student'
    })

    const token = createToken(user._id)

    const agent = req.useragent;
    const sessionData = {
      device: agent.device || 'Unknown',
      operatingSystem: agent.os,
      browser: agent.browser,
    };
    const session = await saveSession(user._id, sessionData);

    await recordActivity(user._id, 'signup');
    res.status(201).json({ user, token })
  } catch (error) {
    console.error(error.message)
    res.status(400).json({ message: error.message });
  }
}

//Edit Profile
const editProfile = async (req, res) => {
  try {
    const { name, email, phone, anotherPhone, address } = req.body
    const user = await User.findById(req.user._id)
    let existingEmail;
    if (user.email != email) {
      existingEmail = await User.find({ email })
    }
    console.log("Existing Email User: ", existingEmail)
    if (!user) {
      throw Error('هذا المستخدم غير موجود')
    }
    if (existingEmail) {
      throw Error('البريد الإلكتروني الجديد مستخدم بالفعل')
    }
    name ? user.name = name : user.name = user.name
    email ? user.email = email : user.email = user.email
    phone ? user.phone = phone : user.phone = user.phone
    anotherPhone ? user.anotherPhone = anotherPhone : user.anotherPhone = user.anotherPhone
    address ? user.address = address : user.address = user.address

    await user.save()
    console.log("Profile has been edited successfully");
    res.status(201).json({ user });
  }
  catch (error) {
    console.error(error.message)
    res.status(400).json({ message: error.message });
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw Error('يجب إدخال جميع البيانات');
    }
    if (!validator.isEmail(email)) {
      throw Error('بيانات المستخدم غير صحيحة');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw Error('بيانات المستخدم غير صحيحة');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error('بيانات المستخدم غير صحيحة');
    }
    const token = createToken(user._id);
    
    const activeSession = user.sessions.find(session => !session.logoutTime);
    if (activeSession) {
      throw Error('يجب تسجيل الخروج من الجهاز الآخر');
    }
    const agent = req.useragent;
    const sessionData = {
      device: agent.device || 'Unknown',
      operatingSystem: agent.os,
      browser: agent.browser,
    };
    const session = await saveSession(user._id, sessionData);
    console.log('Session id:', session._id);
    console.log('Session saved:', session);
    await recordActivity(user._id, 'login');
    console.log('User Logged in Successfully..');
    res.status(201).json({ user, token, session });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};


const getUser = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findById(id).select('-password')
    if (!user) {
      throw Error('لا يوجد مستخدم')
    }
    res.status(200).json(user)
  }
  catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    if (!users) {
      throw Error('لا يوجد مستخدمين')
    }
    res.status(200).json(users)
  }
  catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }

}

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      throw Error('يجب إدخال البريد الإلكتروني')
    }
    if (!validator.isEmail(email)) {
      throw Error("البريد الإلكتروني غير صحيح")
    }
    const user = await User.findOne({ email })
    if (!user) {
      throw Error("البريد الإلكتروني غير موجود")
    }
    otpCode = Math.floor(100000 + Math.random() * 900000)
    console.log("OTP:", otpCode)
    sendEmail({ recipient_email: email, otpCode })
    res.status(201).json({ message: 'تم إرسال رمز OTP بنجاح' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}

const otpVerification = async (req, res) => {
  try {
    let { OTP } = req.body
    OTP = parseInt(OTP)
    console.log("Correct OTP:", otpCode)
    console.log("Entered OTP:", OTP)
    if (!OTP) {
      throw Error('يجب إدخال رمز OTP')
    }
    if (OTP !== otpCode) {
      throw Error("رمز OTP غير صحيح")
    }
    res.status(201).json({ message: 'تم التحقق بنجاح' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, password, passwordAgain } = req.body
    if (!password || !passwordAgain) {
      throw Error('يجب إدخال كلمة المرور وتأكيدها')
    }
    if (!validator.isStrongPassword(password)) {
      throw Error("كلمة المرور غير قوية")
    }
    if (password !== passwordAgain) {
      throw Error("كلمة المرور غير متطابقة")
    }
    const user = await User.findOne({ email })
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    user.password = hash
    user.save()
    res.status(201).json({ message: 'تم تغيير كلمة المرور بنجاح' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}

const numOfStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).countDocuments()
    res.status(200).json({ students })
  }
  catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}

const getImgUploadKey = async (req, res) => {
  try {
    const key = process.env.IMG_UPLOAD_KEY;
    console.log("Image upload key is: ", key)
    res.status(200).json({ key })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
    res.status(200).json({ students })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error: ', error.message)
  }
}

const logout = async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  const activeSession = user.sessions.find((session) => !session.logoutTime);
  if (activeSession) {
    activeSession.logoutTime = new Date();
    await user.save();
  }
  await recordActivity(user._id, 'logout');
  console.log('تم تسجيل الخروج بنجاح')
  res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
};

const activityHandler = async (req, res) => {
  const userId = req.params.userId;
  const data = await getUserActivityData(userId);
  res.status(200).json(data);
};

module.exports = {
  signup, editProfile, login, logout,
  getUser, getAllUsers, forgetPassword, otpVerification,
  resetPassword, addAdmin, numOfStudents, getImgUploadKey,
  getStudents, activityHandler
}