const Docker = require('dockerode');
const logger = require('./logger');
const redisQ = require('./redisQueue')
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock" });


createRoom = async(image, roomId, memLimit, cpuLimit, host, network, homePath) => {
    let auxContainer;
    let res = {};
    logger.info(`creating docker container for room ${roomId} from image ${image}`)
    try {
        auxContainer = await docker.createContainer({
            Image: image,
            name: roomId,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Labels: {
                [`traefik.http.routers.${roomId}.rule`]: "Host(`" + host + "`) && PathPrefix(`/" + roomId + "`)",
                [`traefik.http.middlewares.${roomId}-stripprefix.stripprefix.prefixes`]: "/" + roomId,
                [`traefik.http.middlewares.${roomId}-auth.forwardauth.address`]: process.env.AUTH_SERVER_URL,
                [`traefik.http.middlewares.${roomId}-ratelimit.ratelimit.average`]: "100",
                [`traefik.http.middlewares.${roomId}-ratelimit.ratelimit.burst`]: "50",
                [`traefik.http.routers.${roomId}.middlewares`]: `${roomId}-stripprefix, ${roomId}-auth, ${roomId}-ratelimit`,
                [`traefik.http.middlewares.${roomId}-auth.forwardauth.trustForwardHeader`]: "true"
            },
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            HostConfig: {
                "Memory": parseInt(process.env.USER_SERVER_MEM_LIMIT),
                "CpuPeriod": parseInt(process.env.USER_SERVER_CPU_PERIOD),
                "CpuQuota": parseInt(process.env.USER_SERVER_CPU_QUOTA)
            },
            NetworkingConfig: {
                EndpointsConfig: {
                    [network]: {}
                }
            },
            Volumes: {
                "/home/user/": {}
            },
            Hostconfig: {
                Binds: [`${homePath}/:/home/user/`]
            }
        })

        logger.info(`starting docker container for room ${roomId} from image ${image}`)
        await auxContainer.start();

        logger.info(`Setting up user directory for room ${roomId}`)
        const exec = await auxContainer.exec({ Cmd: "/bin/bash /home/setup.sh".split(' ') })
        await exec.start({})
        logger.info(`Docker container ready for room ${roomId}`)
        await redisQ.connect()
        await redisQ.push(process.env.AUTO_CULL_QUEUE, {
            roomId,
            shouldCull: false,
            timestamp: new Date().toISOString(),
        })
        await redisQ.push(process.env.AUTO_SAVE_QUEUE, {
            roomId,
            timestamp: new Date().toISOString(),
        })
        await redisQ.set(roomId, true)
        res = {
            "status": "created",
            "roomURL": `${host}/${roomId}`
        }
    } catch (err) {
        logger.error(`error occurred while creating for room ${roomId} from image ${image} ${err}`)
        res = {
            "status": "error"
        }
    }

    return res
}

stopAndRemoveContainer = (containerId) => {
    const container = docker.getContainer(containerId)
    return new Promise(((resolve, reject) => {
        container.stop({}, (err) => {
            if (err && err.statusCode === 404)
                reject(JSON.stringify({ code: 404, error: "Container does not exist" }))
            else if (err)
                reject(JSON.stringify({ code: 0, error: "Unknown error" }))
            else {
                container.remove({}, (err) => {
                    if (err && err.statusCode === 404)
                        reject(JSON.stringify({ code: 404, error: "Container does not exist" }))
                    else if (err)
                        reject(JSON.stringify({ code: 0, error: "Unknown error" }))
                    else
                        resolve()

                })
            }
        })
    }))
}

// createRoom('pratik', 'cvbn', '', '', 'localhost', 'executeit', '/home/userdata/room2243')

module.exports = { createRoom, stopAndRemoveContainer }