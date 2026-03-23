const baseTemplate = (content) => {
    return `
    <div style="font-family: Arial, san-serif, background: #f4f4f4; padding: 20px;">
        <div style="max-width:600 px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">

            <h2 style="text-align: center; color: #4F46E5;">AstraaHR</h2>

            ${content}

            <hr style="margin: 20px 0;" />

            <p style="font-size: 12px; color: #888; text-align: center;">
                © ${new Date().getFullYear} AstraaHR. Allrights reserved.
            </p>
        </div>
    </div>
    `
}

export const welcomeTemplate = (user) => {
    const content = `
        <h3>Welcome ${user.name} 🎉</h3>
        <p>Your account has been successfully created.</p>

        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>

        <p>We are excited to have you onboard 🚀</p>
    `
    return baseTemplate(content)
}

export const taskAssignedTemplate = (user, task) => {
    const content = `
        <h3>New Task Assigned 📝</h3>
        <p>Hello ${user.name},</p>

        <p>You have assigned a new task:</p>

        <ul>
            <li><strong>Title:</strong> ${task.title}</li>
            <li><strong>Description:</strong> ${task.description || "N/A"}</li>
            <li><strong>Deadline:</strong> ${task.deadline || "not specified"}</li>
        </ul>

        <p>Please complete it before deadline.</p>
    `
    return baseTemplate(content)
}

export const leaveApprovedTemplate = (user, leave) => {
    const content = `
        <h3>Leave Approved ✅</h3>
        <p>Hello ${user.name},</p>

        <p>Your leave request has been approved.</p>

        <ul>
            <li><strong>Type:</strong> ${leave.leaveType}</li>
            <li><strong>From:</strong> ${leave.startDate}</li>
            <li><strong>To:</strong> ${leave.endDate}</li>
            <li><strong>Total Days:</strong> ${leave.totalDays}</li>
        </ul>

        <p>Enjoy your time off 😉</p>
    `
    return baseTemplate(content)
}

export const leaveRejectedTemplate = (user, leave) => {
    const content = `
        <h3>Leave Rejected ❌</h3>
        <p>Hello ${user.name},</p>

        <p>Your leave request has been cancelled.</p>

        <ul>
            <li><strong>Type:</strong> ${leave.leaveType}</li>
            <li><strong>From:</strong> ${leave.startDate}</li>
            <li><strong>To:</strong> ${leave.endDate}</li>
        </ul>

        <p>Please contact HR to further clarification.😊</p>
    `
    return baseTemplate(content)
}

export const payslipPublishedTemplate = (user, leave) => {
    const content =`
        <h3>Payslip available 💲</h3>
        <p>Hello ${user.name},</p>

        <p>Your payslip for <strong>${payslip.month}/${payslip.year}{/strong} is ready.</p>

        <ul>
           <li><strong>Net Salary:</strong> ₹${payslip.netSalary}</li>
        </ul>

        <p>Please log in to download your payslip.</p>
    `
    return baseTemplate(content)
}

export const genericNotificationTemplate = (user, message) => {
    const content= `
    <h3>Notification 🔔</h3>
    <p>Hello ${user.name},</p>

    <p>$message</p>
    `
    return baseTemplate(content)
}