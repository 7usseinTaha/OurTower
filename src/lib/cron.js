import cron from "cron";
import https from "http";

const job = new cron.CronJob("/14 * * * *",function(){
https 
.get(process.env.API_URL, (res) =>{
    if (res.statusCode === 200) console.log("GET request sent successfully");
    else console.log("GET request failed",res.statusCode)
})
});
export default job;