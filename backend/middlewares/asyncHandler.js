

const asyncHandler = (err, req, res, next) => {
    console.error(err.stack)

    const statusCode = err.statusCode || 500
    
    res.status(statusCode).json({success : false, message : err.message || 'internal server error'})
}

export default asyncHandler