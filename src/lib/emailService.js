import emailjs from '@emailjs/browser';

// --- CONFIGURATION ---
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// TEMPLATE_IDs
const VERIFY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_VERIFY_TEMPLATE_ID;
const EXPIRY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_EXPIRY_TEMPLATE_ID;
const REJECT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_REJECT_TEMPLATE_ID;

/**
 * Sends a generic email using EmailJS
 * @param {string} templateId 
 * @param {object} templateParams 
 */
const sendEmail = async (templateId, templateParams) => {
    try {
        // ENABLED REAL SENDING
        if (!SERVICE_ID || !PUBLIC_KEY || !templateId) {
            console.warn("EmailJS Keys are missing. Email will not be sent.");
            return { success: false, error: "Missing EmailJS Configuration" };
        }

        const response = await emailjs.send(SERVICE_ID, templateId, templateParams, PUBLIC_KEY);
        console.log("Email Sent Successfully:", response.status, response.text);
        return { success: true, status: response.status };

        // console.log(`[Mock Email] Sending to ${templateParams.to_email} | Template: ${templateId}`);
        // return { success: true, mock: true };
    } catch (error) {
        console.error("Email Failed:", error);
        return { success: false, error: error };
    }
};

/**
 * 1. Account Verification & Access Granted
 * Trigger: Admin approves a pending user.
 */
export const sendVerificationEmail = async (email, name, token, expiryDate) => {

    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const templateParams = {
        to_name: name,
        to_email: email,
        subject: `Welcome to EDI Enviro - Access Granted`,
        message_html: `
      Dear ${name},

      We are pleased to inform you that your account verification has been successfully completed. You have been granted full access to the EDI Enviro Engineering Tools and Proposal Generator.

      ### Your Access Credentials:
      - Access Token: ${token}
      - Subscription Status: Active
      - Valid Until: ${formattedDate}

      You can now access all premium features by logging into your dashboard. Please keep your Access Token confidential.

      If you have any questions or require assistance, please do not hesitate to contact our technical support team.

      Best Regards,
      EDI Enviro Administrative Team
      Excellence in Environmental Engineering
    `
    };

    return await sendEmail(VERIFY_TEMPLATE_ID, templateParams);
};

/**
 * 2. Subscription Expiry Warning
 * Trigger: Subscription is expiring in 5 days or less.
 */
export const sendExpiryEmail = async (email, name, daysLeft, expiryDate) => {

    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const templateParams = {
        to_name: name,
        to_email: email,
        subject: `Action Required: Service Expiry Notice - ${daysLeft} Days Remaining`,
        message_html: `
      Dear ${name},

      We hope you are finding value in our services.

      This is a formal notification that your access subscription for EDI Enviro Tools is scheduled to expire in ${daysLeft} days, on ${formattedDate}.

      To ensure uninterrupted access to the Proposal Generator and Engineering Calculators, we highly recommend renewing your subscription before the expiry date.

      ### Renewal Instructions:
      Please contact our sales department or reply to this email to initiate the renewal process.
      (Note: If your subscription lapses, you may lose access to saved proposals and calculator history.)

      Best Regards,
      EDI Enviro Administrative Team
    `
    };

    return await sendEmail(EXPIRY_TEMPLATE_ID, templateParams);
};

/**
 * 3. Application Rejected
 * Trigger: Admin rejects a signup request.
 */
export const sendRejectionEmail = async (email, name) => {

    const templateParams = {
        to_name: name,
        to_email: email,
        subject: `Update on your EDI Enviro Account Application`,
        message_html: `
      Dear ${name},

      Thank you for your interest in EDI Enviro Engineering Tools.

      We have reviewed your application for account access. We regret to inform you that we are unable to approve your request at this time.

      This decision may be due to incomplete documentation or eligibility criteria. If you believe this is an error or if you would like to provide additional information, please contact our support team.

      Best Regards,
      EDI Enviro Administrative Team
    `
    };

    return await sendEmail(REJECT_TEMPLATE_ID, templateParams);
};

/**
 * Batch process to check for expiring accounts and send emails
 */
export const checkAndSendReminders = async (profiles) => {
    console.log("Starting Expiry Check...", profiles);
    const now = new Date();
    const warningThresholdDays = 5;
    let sentCount = 0;

    for (const user of profiles) {
        if (user.subscription_status === 'active' && user.subscription_end) {
            const expiry = new Date(user.subscription_end);
            const diffTime = expiry - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0 && diffDays <= warningThresholdDays) {
                console.log(`User ${user.full_name} is expiring in ${diffDays} days. Sending email...`);

                await sendExpiryEmail(
                    user.email,
                    user.full_name,
                    diffDays,
                    user.subscription_end
                );
                sentCount++;
            }
        }
    }

    return { totalSent: sentCount };
};

/**
 * 4. Contact Form Inquiry
 * Trigger: User submits the 'Send us a Message' form.
 */
const CONTACT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;

export const sendContactEmail = async (data) => {
    const templateParams = {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone || 'N/A',
        company: data.company || 'N/A',
        service: data.service || 'General',
        message: data.message
    };

    return await sendEmail(CONTACT_TEMPLATE_ID, templateParams);
};
