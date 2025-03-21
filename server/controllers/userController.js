import ErrorHandler from "../middleware/error.middleware.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/userModel.js";

export const register = catchAsyncError(async(req,res,next)=>{
    try {
        const {name,email,phone,password,verificationMethod} = req.body

        if(!name || !email || !phone || !password || !verificationMethod){
            return next(new ErrorHandler("All fields are required",400))
        }

        function validatePhoneNumber(phone){
            const phoneRegex = /^+919\d(9)$/
            return phoneRegex.test(phone)
        }
        if(!validatePhoneNumber(phone)){
            return next(new ErrorHandler("Invalid phone number",400))
        }


        const existingUser = await User.findOne({
            $or : [
                {
                    email,
                    accountVerified : true
                },
                {
                    phone,
                    accountVerified : true
                }
            ]
        })


        if(existingUser){
            return next(new ErrorHandler("Phone or Email is already used",400))
        }


        const registerationAttemptsByUser = await User.find({
            $or:[
                {
                    phone,accountVerified:false
                },
                {
                    email,accountVerified:false
                }
            ]
        })

        if(registerationAttemptsByUser.length >= 3){
            return next(new ErrorHandler("You have exceeded the maximum number of attempt (3). Please try after an hour",400))
        }



    } catch (error) {
        
    }
})