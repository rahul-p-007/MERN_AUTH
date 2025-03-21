class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err,req,res,next)=>{
err.statusCode = err.statusCode || 500
err.message = err.message || "Internal server error"
console.log(err)
if(err.name === "CastError"){
    const message = `Invlaid ${err.path}`
    err = new ErrorHandler(message,400)
} 
if(err.name === "JsonWebTokenError"){
    const message = `Json web token is Invaild try again`
    err = new ErrorHandler(message,400)
} 
if(err.name === "TokenExpiredError"){
    const message = `Json web token is expire `
    err = new ErrorHandler(message,400)
} 
if(err.code === 1100){
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
    err = new ErrorHandler(message,400)
}
return res.status(err.statusCode).json({
    success : false,
    message : err.message
})
}
export default ErrorHandler