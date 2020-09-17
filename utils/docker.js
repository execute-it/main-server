const Docker = require('dockerode');
const logger = require('./logger');
const redisQ = require('./redisQueue')


createRoom = async(image, roomId, memLimit, cpuLimit, host, network, homePath) => {
    const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET });
    let auxContainer;
    let res = {};
    logger.info(`creating docker container for room ${roomId} from image ${image}`)
    await docker.createContainer({
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
            "Memory": 26435456,
            "CpuPeriod": 100000,
            "CpuQuota": 50000
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
    }).then(function(container) {
        logger.info(`starting docker container for room ${roomId} from image ${image}`)
        auxContainer = container;
        return auxContainer.start();
    }).then(function() {
        logger.info(`started docker container for room ${roomId} from image ${image}`)
        auxContainer.exec({Cmd: "/bin/bash /home/setup.sh".split(' ')}).then((exec)=>{
            exec.start({}).then(()=>{
                redisQ.connect().then(()=>{
                    redisQ.push(process.env.AUTO_CULL_QUEUE, {
                        roomId,
                        shouldCull: false,
                        timestamp: new Date().toISOString(),
                    })
                    redisQ.push(process.env.AUTO_SAVE_QUEUE, {
                        roomId,
                        timestamp: new Date().toISOString(),
                    })
                })
                res = {
                    "status": "created",
                    "roomURL": `${host}/${roomId}`
                }
            })
        })
    }).catch(function(err) {
        logger.error(`error occurred while creating for room ${roomId} from image ${image} ${err}`)
        res = {
            "status": "error"
        }
    });

    return res
}

// createRoom('pratik', 'cvbn', '', '', 'localhost', 'executeit', '/home/userdata/room2243')

exports.createRoom = createRoom