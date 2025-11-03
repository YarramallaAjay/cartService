
import { readFile } from 'fs/promises';
import { Redis } from 'ioredis'

async function StartUpInstance(){

    let redisClient:Redis;

    const mockData=await readFile("./src/data/mockData.json",'utf-8')


    async function startRedis(){

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
                await redisClient.set(product.id, JSON.stringify(product))
            }
        }
        if(data_to_be_load.coupons){
            for(const coupon of data_to_be_load.coupons){
                await redisClient.set(`coupon:${coupon.id}`, JSON.stringify(coupon))
            }
        }

    }


    async function getIntance(type:"Redis"){
        switch(type){
            case "Redis":
                return redisClient;
            default:
                return null;
        }
    }

    async function startAll(type:"Redis"|"MongoDB") {
        switch(type){
            case "Redis":
                return await startRedis();
            // case "MongoDB":
            //     return await startMongoDB(); //need to implement
            default:
                return null;
        }
    }

    return {startAll,
        startRedis,
        getIntance
    }
}

export default StartUpInstance;

