
import { readFile } from 'fs/promises';
import { Redis } from 'ioredis'

async function WarmpUp(){

    let redisClient:Redis;

    const mockData=await readFile("./src/data/mockData.json",'utf-8')


    async function startRedis(){

        //Start Redis and connect to it, handle start up issues
        //load the mock data to redis.

        if(redisClient==null){
        redisClient=new Redis({
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                host: process.env.REDIS_HOST || "127.0.0.1",
        })
        }

        redisClient.on("connect",()=>{
           redisClient.ping().then(()=>{console.log("Connected to redis and pinged")

            
           }).catch((err)=>console.log(`error with redis ping:${err}`))
        });

        redisClient.on("error",(err)=>console.log(`error with redis connection : ${err}`))

        if(mockData==null|| mockData===''){
            console.log("no data present to load")
            return ;
        }

        const data_to_be_load=JSON.parse(mockData)
        if(data_to_be_load.products){
            for(const product of data_to_be_load.products){
                console.log(product)
                await redisClient.set(product.id, JSON.stringify(product))
            }
        }
        if(data_to_be_load.coupons){
            for(const coupon of data_to_be_load.coupons){
                console.log(coupon)
                await redisClient.set(coupon.id, JSON.stringify(coupon))
            }
        }

        console.log(await redisClient.get("PRODUCT_2"))
       
    }


    startRedis()

}

export default WarmpUp

