import User from '../models/User.js';
import  JWT from "jsonwebtoken";

const generateToken = (userid) => {
  return JWT.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

// Function to add users
export const addUsers =   async (req, res) => {
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
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "# يرجى إدخال كلمة مرور قوية تحتوي على 8 أحرف أو أكثر، تشمل حرفًا واحدًا على الأقل، رقمًا واحدًا، ورمزًا خاصًا مثل @ , ! أو #."
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
      console.log("All feilded is reqused")
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "اسم المستخدم او كلمة المرور غير صحيحة"  });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "اسم المستخدم او كلمة المرور غير صحيحة" });
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
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    console.log("Error logging in:",req.body);
  }
};

// Function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
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
    const { username, email, role, profileImg } = req.body;

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

    await user.save();

    res.status(200).json({
      message: "تم تحديث المستخدم بنجاح",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg,
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
