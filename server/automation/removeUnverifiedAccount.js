import cron from "node-cron"
import { User } from "../model/userModel.js"

export const removeUnverifiedAccount =  () =>{
    cron.schedule("*/30 * * * *",async()=>{
        const thirtyMinuteAgo = new (Date.now() -30 *60 *1000)
        const usersToDelete = await User.deleteMany({
            accountVerified : false,
            createAt :{$lt : thirtyMinuteAgo}
        })

    })
}