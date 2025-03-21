import ErrorHandler from "../middleware/error.middleware.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, phone, password, verificationMethod } = req.body;

        if (!name || !email || !phone || !password || !verificationMethod) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        const existingUser = await User.findOne({
            $or: [
                { email, accountVerified: true },
                { phone, accountVerified: true }
            ]
        });

        if (existingUser) {
            return next(new ErrorHandler("Phone or Email is already used", 400));
        }

        const registerationAttemptsByUser = await User.find({
            $or: [
                { phone, accountVerified: false },
                { email, accountVerified: false }
            ]
        });

        if (registerationAttemptsByUser.length >= 3) {
            return next(new ErrorHandler("You have exceeded the maximum number of attempts (3). Please try after an hour", 400));
        }

        const userData = { name, email, phone, password };
        const user = await User.create(userData);
        const verificationCode = await user.generateVerificationCode();
        await user.save();

        // Corrected function call
        sendVerificationCode(verificationMethod, verificationCode, email, name, phone, res);

    } catch (error) {
        next(error);
    }
});

async function sendVerificationCode(verificationMethod, verificationCode, email, name, phone, res) {
    try {
        if (verificationMethod === "email") {
            const message = generateEmailTemplate(name, verificationCode);
            sendEmail({ email, subject: "Your Verification Code", message });
            return res.status(200).json({
                success: true,
                message: `Verification email sent successfully to ${name}`
            });

        } else if (verificationMethod === "phone") {
            const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
            await client.calls.create({
                twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
                from: process.env.TWILIO_PHONE_NO,
                to: phone
            });

            return res.status(200).json({
                success: true,
                message: `OTP Sent`
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid verification method"
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Verification failed to send"
        });
    }
}

function generateEmailTemplate(name, verificationCode) {
    const expiryTime = 10; // Set expiry time (in minutes)
    return `
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 20px; 
    border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #555;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #555;">Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #333; background: #f3f3f3; 
            padding: 10px; border-radius: 5px; display: inline-block; margin: 15px 0;">
            ${verificationCode}
        </div>
        <p style="font-size: 16px; color: #555;">This code will expire in <strong>${expiryTime} minutes</strong>. 
        Please do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
        <div style="font-size: 12px; color: #777; margin-top: 15px;">
            <p>Best regards,</p>
            <p><strong>Your Company Name</strong></p>
        </div>
    </div>`;
}
