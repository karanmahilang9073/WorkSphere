import JWT from 'jsonwebtoken'

const generateToken = (userId, role) => {
    return JWT.sign(
        {id : userId, role},
        process.env.JWT_SECRET,
        {expiresIn : "10d"}
    )
}

export default generateToken;