import "dotenv/config";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const generateToken = (userId) => {
  return JWT.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Function to add users
export const addUsers = async (req, res) => {
  try {
    // Extract user details from request body
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "البريد الإلكتروني غير صالح" });
    }

    // check if password is strong
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "# يرجى إدخال كلمة مرور قوية تحتوي على 8 أحرف أو أكثر، تشمل حرفًا واحدًا على الأقل، رقمًا واحدًا، ورمزًا خاصًا مثل @ , ! أو #.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: " اسم  المستخدم موجود مسبقا" });
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "البريد الإلكتروني موجود مسبقا" });
    }

    //get avatar image from gravatar
    const profileImg = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    // Create new user object
    const newUser = new User({
      username,
      email,
      password,
      role,
      profileImg,
      isActive: false,
      editeRole: false,
      updateRole: false,
      deleteRole: false,
      isVerified: false,
    });

    await newUser.save();
    // Send response
    res.status(201).json({
      message:
        "تم إضافة المستخدم بنجاح.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profileImg: newUser.profileImg,
        isActive: newUser.isActive,
        addRole: newUser.addRole,
        editRole: newUser.editRole,
        deleteRole: newUser.deleteRole,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إضافة المستخدم" });
  }
};

export const sendLinkInEmail = async (req, res) => {
  try {
    // Extract user details from request body
    const { userID, email } = req.body;

    const user = await User.findById(userID, "-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    // Generate JWT token
    const token = generateToken(userID);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationToken = JWT.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationLink = `${process.env.API_URL}/api/auth/verify-email/${user._id}/${verificationToken}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "تفعيل حساب البريد الإلكتروني",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 30px;">
          <center>
            <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333;">مرحبًا ${user.username}</h2>
              <p style="font-size: 16px; color: #555;">
          يرجى الضغط على الرابط التالي لتفعيل حسابك:
              </p>
            
               <a href="${verificationLink}" target="_blank"
        style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">        تفعيل الحساب
      </a>
              <p style="font-size: 14px; color: #999;">
                هذا الرابط صالح لمدة <strong>ساعة واحدة فقط</strong>.
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #aaa;">
                إذا لم تطلب انشاء مستخدم يمكنك تجاهل هذا البريد.
              </p>
            </div>
          </center>
        </div>
      `,
    });

    // Send response
       res.json({ message: "تم إرسال الرابط إلى بريدك الإلكتروني" });

  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إضافة المستخدم" });
  }
};
export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== userId) {
      return  res.send(`
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>تفعيل الحساب</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 50px;
              }
              .box {
                background: white;
                padding: 40px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h2 {
                color: red;
              }
              a {
                display: inline-block;
                margin-top: 20px;
                text-decoration: none;
                color: white;
                background: #28a745;
                padding: 10px 20px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>  طلبك غير صالح </h2>
            </div>
          </body>
        </html>
      `);;
    }

    const user = await User.findById(userId);
    if (!user) return  res.send(`
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>تفعيل الحساب</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 50px;
              }
              .box {
                background: white;
                padding: 40px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h2 {
                color: #28a745;
              }
              a {
                display: inline-block;
                margin-top: 20px;
                text-decoration: none;
                color: white;
                background: #28a745;
                padding: 10px 20px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>   المستخدم غير موجود</h2>
            </div>
          </body>
        </html>
      `);

    if (user.isVerified) {
      return  res.send(`
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>تفعيل الحساب</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 50px;
              }
              .box {
                background: white;
                padding: 40px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h2 {
                color: #28a745;
              }
              a {
                display: inline-block;
                margin-top: 20px;
                text-decoration: none;
                color: white;
                background: #28a745;
                padding: 10px 20px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2> الحساب مفعل مسبقاً</h2>
              <p>يمكنك الآن تسجيل الدخول إلى حسابك</p>
              <a href="ourtower://login">فتح التطبيق</a>
            </div>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    await user.save();
    res.send(`
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>تفعيل الحساب</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 50px;
              }
              .box {
                background: white;
                padding: 40px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h2 {
                color: #28a745;
              }
              a {
                display: inline-block;
                margin-top: 20px;
                text-decoration: none;
                color: white;
                background: #28a745;
                padding: 10px 20px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>✅ تم تفعيل بريدك الإلكتروني بنجاح</h2>
              <p>يمكنك الآن تسجيل الدخول إلى حسابك</p>
              <a href="ourtower://login">فتح التطبيق</a>
            </div>
          </body>
        </html>
      `);
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    return  res.send(`
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>تفعيل الحساب</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 50px;
              }
              .box {
                background: white;
                padding: 40px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h2 {
                color: red;
              }
              a {
                display: inline-block;
                margin-top: 20px;
                text-decoration: none;
                color: white;
                background: #28a745;
                padding: 10px 20px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2> انتهت صلاحية رابط التفعيل، يرجى طلب رابط جديد</h2>
            </div>
          </body>
        </html>
      `);
  }
};

// Function to login users
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("All feilded is reqused");
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "اسم المستخدم او كلمة المرور غير صحيحة" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "اسم المستخدم او كلمة المرور غير صحيحة" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: " يرجى تفعيل البريد الإلكتروني أولاً  " });
    }

    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg,
        isActive: user.isActive,
        addRole: user.addRole,
        editRole: user.editRole,
        deleteRole: user.deleteRole,
        isVerified:user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
  }
};

// Function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المستخدمين" });
  }
};

// Function to Update a user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      username,
      email,
      role,
      profileImg,
      isActive,
      addRole,
      editRole,
      deleteRole,
    } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "معرف المستخدم مطلوب" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // Update user details
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.profileImg = profileImg || user.profileImg;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.addRole = addRole !== undefined ? addRole : user.addRole;
    user.editRole = editRole !== undefined ? editRole : user.editRole;
    user.deleteRole = deleteRole !== undefined ? deleteRole : user.deleteRole;

    await user.save();

    res.status(200).json({
      message: "تم تحديث المستخدم بنجاح",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg,
        isActive: user.isActive,
        addRole: user.addRole,
        editRole: user.editRole,
        deleteRole: user.deleteRole,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث المستخدم" });
  }
};

// Function to delete a user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "معرف المستخدم مطلوب" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف المستخدم" });
  }
};

// Function to get user profile
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "معرف المستخدم مطلوب" });
    }

    // Fetch user profile
    const user = await User.findById(userId, "-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
      isActive: user.isActive,
      addRole: user.addRole,
      editRole: user.editRole,
      deleteRole: user.deleteRole,
      isVerified: user.isVerified,

    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب ملف تعريف المستخدم" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const token = generateToken(user._id);

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    // إعداد البريد
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.API_URL}/api/auth/reset-password/${user._id}/${token}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "إعادة تعيين كلمة المرور",
      html: `
  <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 30px;">
    <center>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; max-width: 600px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">مرحبًا ${user.username}</h2>
        <p style="font-size: 16px; color: #555;">
          لقد طلبت إعادة تعيين كلمة المرور لحسابك لدينا.
        </p>
        <p style="font-size: 16px; color: #555;">
          اضغط على الزر أدناه لإعادة تعيين كلمة المرور:
        </p>
        <a href="${resetLink}" target="_blank"
          style="display: inline-block; padding: 12px 25px; margin: 20px 0;
                 background-color: #0E4D28";
                 color: #fff; text-decoration: none;
                 font-size: 16px; border-radius: 5px;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="font-size: 14px; color: #999;">
          هذا الرابط صالح لمدة <strong>ساعة واحدة فقط</strong>.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #aaa;">
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
        </p>
      </div>
    </center>
  </div>
`,
    });

    res.json({ message: "تم إرسال الرابط إلى بريدك الإلكتروني" });
  } catch (err) {
    res.status(500).json({ message: "فشل إرسال الرابط", error: err.message });
  }
};

export const updatePassword = async (req, res) => {
  const { userID } = req.params;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { currentPassword, newPassword } = req.body;

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("+password");

    if (!user)
      return res.status(400).json({ message: "رمز غير صالح أو منتهي" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }
    user.password = newPassword;

    await user.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "فشل التحديث", error: err.message });
  }
  // res.render("resetPassword.ejs");
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // تحقق أن الـ userId الموجود في التوكن يطابق الموجود في الرابط
    if (decoded.userId !== userId) {
      return res.status(400).json({ message: "طلب غير صالح أو محاولة تلاعب" });
    }

    const user = await User.findById({
      _id: userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: "رمز غير صالح أو منتهي" });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "فشل التحديث", error: err.message });
  }
};
