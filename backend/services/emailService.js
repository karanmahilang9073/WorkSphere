import { getTransporter } from "../config/email.js";
import { leaveApprovedTemplate, leaveRejectedTemplate, payslipPublishedTemplate, taskAssignedTemplate, welcomeTemplate } from "../utils/emailTemplate.js";


export const welcomeMail = async({name, email}) => {
    const transporter = getTransporter()
    try {
        return await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : email,
            subject : `welcome ${name} 🎉`,
            html : welcomeTemplate({name, email})
        })
    } catch (error) {
        console.log('email error', error.message)
        throw error
    }
}

export const taskAssignMail = async({user, task}) => {
    const transporter = getTransporter()
    try {
        return await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : user.email,
            subject : `new task assigned: ${task.title} 📌`,
            html : taskAssignedTemplate(user,  task)
        })
    } catch (error) {
        console.error('task email error', error.message)
        throw error
    }
}

export const leaveApprovedMail = async({user, leave}) => {
    const transporter = getTransporter()
    try {
        await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : user.email,
            subject : 'your leave has been approved ✅',
            html : leaveApprovedTemplate(user, leave)
        })
    } catch (error) {
        console.error('leave email error', error.message)
        throw error
    }
}

export const leaveRejectedMail = async({user, leave}) => {
    const transporter = getTransporter()
    try {
        await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : user.email,
            subject : 'your leave request was rejected ❌',
            html : leaveRejectedTemplate(user, leave)
        })
    } catch (error) {
        console.error('leave email error', error.message)
        throw error
    }
}

export const payPublishedMail = async({user, payslip}) => {
    const transporter = getTransporter()
    try {
        return await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : user.email,
            subject : `your payslip for ${payslip.month} is ready 💸`,
            html : payslipPublishedTemplate(user, payslip)
        })
    } catch (error) {
        console.error('payslip email error', error.message)
        throw error
    }
}