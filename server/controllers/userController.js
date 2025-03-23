import ErrorHandler from "../middleware/error.middleware.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto"

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, phone, password, verificationMethod } = req.body;

        if (!name || !email || !phone || !password || !verificationMethod) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        function validatePhoneNumber(phone) {
            const phoneRegex = /^\+91\d{10}$/;  // Matches +91 followed by 10 digits
            return phoneRegex.test(phone);
        }
        
        if (!validatePhoneNumber(phone)) {
            return next(new ErrorHandler("Invalid phone number.", 400));
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
            const verificationCodeWithSpace = verificationCode
              .toString()
              .split("")
              .join(" ");
            await client.calls.create({
              twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
              from: process.env.TWILIO_PHONE_NO,
              to: phone,
            });
            res.status(200).json({
              success: true,
              message: `OTP sent.`,
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
export const verifyOTP = catchAsyncError(async(req,res,next)=>{
    const {email,otp,phone} = req.body;

    function validatePhoneNumber(phone) {
        const phoneRegex = /^\+91\d{10}$/;  // Matches +91 followed by 10 digits
        return phoneRegex.test(phone);
    }
    
    if (!validatePhoneNumber(phone)) {
        return next(new ErrorHandler("Invalid phone number.", 400));
    }
    
    try {
        const userAllEntries = await User.find({
            $or:[
                {email,accountVerified : false},{
                    phone,accountVerified:false,
                }
            ]
        }).sort({createdAt: -1});



        if(!userAllEntries){
            return next(new ErrorHandler("User not found",404))

           
        }


        // if user found

        let user ;
        if(userAllEntries.length > 1){
            user = userAllEntries[0];


           await User.deleteMany({
            _id: { $ne :user._id},
            $or: [
            {
                phone,accountVerified :false
            },
            {
                email,accountVerified :false
            }
            ]
           })
        }else{
            user = userAllEntries[0];
        }
// converting otp to number
        if(user.verificationCode !== Number(otp)){
           return next(new ErrorHandler("Invalid OTP",400))
        }
        // Checking the otp validate or not
        const currentTime = Date.now();
        const verificationCodeExpire= new Date(user.verificationCodeExpir).getTime();
        console.log(currentTime)
        console.log(verificationCodeExpire)

        if(currentTime > verificationCodeExpire){
            return next(new ErrorHandler("OTP Expired",400))
        }


        user.accountVerified = true
        user.verificationCode = null
        user.verificationCodeExpir = null

        await user.save({validateModifiedOnly : true})



        sendToken(user,200,"Account Verified.",res)

    } catch (error) {
        return next(new ErrorHandler("Internal Server Error",500))
    }
})

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required.", 400));
    }
    const user = await User.findOne({ email, accountVerified: true }).select(
      "+password"
    );
    if (!user) {
      return next(new ErrorHandler("Invalid email or password.", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password.", 400));
    }
    sendToken(user, 200, "User logged in successfully.", res);
  });


  export const logout = catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires: new Date(
            Date.now() ),
            httpOnly : true
    }).json({
        success : true,
        message : "Logged out successfully"
    })
  })
  export const getUser = catchAsyncError(async(req,res,next)=>{
    const user = req.user;

    res.status(200).json(
        {
            success :true,
            user
        }
    )

  })


  export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email : req.body.email,accountVerified : true})

    if(!user){
        return next(new ErrorHandler("User not found",404))
    }

    const resetToken = user.generateResetPasswordToken()
    await user.save({validateBeforeSave : false})
  

    const resetPasswordUrl = `${process.env.FRONTED_URL}/password/reset/${resetToken}`

    const message = `Your Reset Password Token is :- \n\n ${resetPasswordUrl} \n\n If you have request this email please ignore it. `

    try{
        sendEmail({email : user.email,subject:"RESET PASSWORD",message})
        res.status(200).json({
            success : true,
            message : `Email sent ot ${user.email} successfully`
        })
    }
    catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave : false})
        return next(new ErrorHandler(error.message ? error.message : "Cannot send reset password token ",500))
    }
})


export const resetPassword = catchAsyncError(async(req,res,next)=>{
    const {token} = req.params
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : {$gt : Date.now()},
    })
    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired",400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password is not matched",400))
    }

    user.password =  req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

sendToken(user,200,"Reset Password Successfully",res)
})