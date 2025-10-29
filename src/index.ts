import Express, { type Express as ExpressApp } from "express"
import WarmUp from "./warmup.js"

const app:ExpressApp=Express()

WarmUp()

app.post("/coupons",async(req,res)=>{

})
app.get("/coupons",async(req,res)=>{

})

app.get("/coupons/{id}",async(req,res)=>{
})
app.put("/coupons/{id}",async(req,res)=>{

})

app.delete("/coupons/{id}",async(req,res)=>{

})

app.post("/coupons/applicable",async(req,res)=>{

})

app.post("/coupons/apply",async(req,res)=>{

})

export default app




