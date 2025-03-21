import mongoose from "mongoose";

export const connection = () =>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName : "MERN_AUTH",

    }).then(()=> {
        console.log("Connected to the database")
    }).catch(err =>{
        console.log(`Some error ${err}`)
    })
}