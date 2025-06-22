import "dotenv/config";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
const generateToken = (userid) => {
  return JWT.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
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
      return res
        .status(400)
        .json({
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
      isActive: true,
      editeRole: false,
      updateRole: false,
      deleteRole: false,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Send response
    res.status(201).json({
      message: "تم إضافة المستخدم بنجاح",
      token,
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
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إضافة المستخدم" });
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

    const resetLink = `${process.env.API_URL}api/auth/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "إعادة تعيين كلمة المرور",
      html: `<p>لقد طلبت إعادة تعيين كلمة المرور</p>
             <p>انقر على الرابط التالي لتعيين كلمة مرور جديدة:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "تم إرسال الرابط إلى بريدك الإلكتروني" });
  } catch (err) {
    res.status(500).json({ message: "فشل إرسال الرابط", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "رمز غير صالح أو منتهي" });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "فشل التحديث", error: err.message });
  }
  // res.render("resetPassword.ejs");
};
