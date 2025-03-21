import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : {
        type : String,
        minLength : [8,"Password must have at least 8 character"],
        maxLength : [32,"Password must have at least 8 character"]
    },
    phone : String,
    accountVerified : {type : Boolean,default:false},
    verificationCode : Number,
    verificationCodeExpir : Date,
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    createAt : {
        type : Date,
        default : Date.now,
    }

})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        next()
    }    
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password)
}


userSchema.methods.generateVerificationCode = function () {
    function generateRandomFiveDigitNumber() {
      const firstDigit = Math.floor(Math.random() * 9) + 1;
      const remainingDigits = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, 0);
  
      return parseInt(firstDigit + remainingDigits);
    }
    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
  
    return verificationCode;
  };
export const User = mongoose.model("User",userSchema)