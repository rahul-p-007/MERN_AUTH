import express from "express";
import {config} from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import {connection} from "./database/dbConnection.js"
import { errorMiddleware } from "./middleware/error.middleware.js";
import userRouter from "./Routes/userRouter.js"
import { removeUnverifiedAccount } from "./automation/removeUnverifiedAccount.js";
export const app = express()

config({path : "./confiq.env"})


app.use(cors({
    origin : [process.env.FRONTED_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use("/api/v1",userRouter)
removeUnverifiedAccount()
connection()

// Always Error middlware at bottom

app.use(errorMiddleware)