import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = mongoose.Schema;

const userSchema = new schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, required: true },
    profileImg: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    addRole: { type: Boolean, default: false },
    editRole: { type: Boolean, default: false },
    deleteRole: { type: Boolean, default: false },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);

export default User;
