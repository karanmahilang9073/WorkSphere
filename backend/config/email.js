import nodemailer from 'nodemailer'

let transporter = null

export const getTransporter = () => {
    if(!transporter){
        transporter = nodemailer.createTransport({
            host : process.env.EMAIL_HOST,
            port : process.env.EMAIL_PORT,
            secure : false,
            auth : {
                user : process.env.EMAIL_USER,
                pass : process.env.EMAIL_PASS
            }
        })
        console.log('email transporter initialized with host:',process.env.EMAIL_HOST)
    }
    return transporter
}