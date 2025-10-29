
import { Redis } from 'ioredis'

async function WarmpUp(){

    let redisClient:Redis;


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
           redisClient.ping().then(()=>console.log("Connected to redis and pinged")).catch((err)=>console.log(`error with redis ping:${err}`))
        });

        redisClient.on("error",(err)=>`error with redis connection : ${err}`)

    }


    startRedis()

}

export default WarmpUp

