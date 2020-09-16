const redis = require("redis")

let redisClient;
module.exports.connect = async ()=>{
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379
    });

    redisClient.on("connect", (err) => {
        // console.info("connected to redisQueue");
    });
    redisClient.on("ready", (err) => {
        // redisNotReady = false;
        return redisClient
    });
}

module.exports.push = (queue, data)=>{
    return new Promise(async (resolve, rej)=>{
    await redisClient.rpush([queue, JSON.stringify(data)], (err, data)=>{
            if(err)
                rej(err)
            else
                resolve(data)
        })
    })
}

module.exports.front = async (queue)=>{
    return new Promise(async (resolve, rej)=>{
        await redisClient.lrange(queue, 0, 0, (err, data)=>{
            if(err)
                rej(err)
            else
                resolve(data)
        })
    })
}

module.exports.pop = async (queue)=>{
    return new Promise(async (resolve, rej)=>{
        await redisClient.lpop([queue], (err, data)=>{
            if(err)
                rej(err)
            else
                resolve(data)
        })
    })
}

module.exports.exists = async (queue, roomId) => {
    return new Promise(async (resolve, rej)=>{
        await redisClient.lrange(queue, 0, -1, (err, data)=>{
            if(err)
                rej(err)
            else {
                for(let i=0;i<data.length;i++)
                    if(JSON.parse(data[i]).roomId === roomId)
                        resolve(true)
                resolve(false)
            }
        })
    })
}