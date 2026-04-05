import JWT from 'jsonwebtoken'
import asyncHandler from './asyncHandler.js';

const authMiddleware = asyncHandler(async(req, res, next) => {
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer ")){
        const  error = new Error('no token provided')
        error.statusCode = 401
        throw error
    }
    const token = header.split(" ")[1]

   try {
     const decoded = JWT.verify(token, process.env.JWT_SECRET)
     req.user = decoded
     next()
   } catch (error) {
    console.error(new Error('invalid or expired token'))
    error.statusCode = 401
    throw error
   }
})

export default authMiddleware