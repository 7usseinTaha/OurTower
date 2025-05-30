import JWT from "jsonwebtoken";
import User from "../models/User.js";

 const protectRoute = async (req, res, next) => {
    
    try {
                // Check if the Authorization header is present
const token = req.headers.authorization?.replace("Bearer ", "");
   if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "ليس لديك صلاحية : غير مصرح لك بالوصول لهذه الصفحة" });
}

    // Verify the token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        // Check if the user exists in the database
        const user = await User.findById(decoded.userid).select("-password");

        // Check if user is found
        if (!user) {
            return res.status(404).json({ message: "ليس لديك صلاحية للوصول إلى هذه الصفحة" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ message: "ليس لديك صلاحية غير مصرح لك   " });
    }
};
 export default protectRoute;