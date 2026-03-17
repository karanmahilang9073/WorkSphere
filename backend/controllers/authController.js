import User from "../models/User.js";
import bcrypt from "bcrypt";

export const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, position } = req.body;
  if (!name || !email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }
    const existeduser = await User.findOne({email})
    if(existeduser){
        const error = new Error('user aleady existed')
        error.statusCode = 409
        throw error
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({name, email, password : hashedPassword})

    const token = JWT.sign(
        {id : user._id},
        process.env.JWT_SECRET,
        {expiresIn : '10d'}
    )

    res.status(200).json({success : true, token,  message : 'user created successfully', 
        user : {
            id : user._id,
            name : user.name,
            email : user.email
        }
    })
})

