const WebSocketServer = require('websocket').server;
const Docker = require('dockerode')
const processOutput = require('./processOutput')

const docker = new Docker({socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock"})

// Handles terminal connections via websocket
module.exports = function handleTerminalConnections(server) {
    const wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false})

    wsServer.on('request', function(request) {
        const pathParams = request.httpRequest.url.split('/').splice(1)

        if(pathParams[0]!=='terminals') {
            request.reject()
            return
        }

        isContainerValid(pathParams[1], (err)=>{
            if(err){
                request.reject()
                return
            }

            const connection = request.accept('terminal-connect', request.origin);
            runExec(connection, pathParams[1])
        })
    })
}

function isContainerValid(containerId, cb) {
    docker.getContainer(containerId).stats({}, err=>{
        cb(err)
    })
}

function runExec(ws, containerId){
    const options = {
        Cmd: "/bin/bash".split(' '),
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Detach: false,
        Tty: true,
    };

    docker.getContainer(containerId).exec(options, function(err, exec) {
        if (err){
            console.log("Error")
            console.error(err);
            return;
        }

        //run the cmd
        exec.start({stdin: true, hijack: true}, function(err, stream) {
            if (err){
                console.log("erreur exec.start")
                console.error(err);
                return;
            }

            processOutput(stream, ws)

            ws.on('message', (msg)=>{
                stream.write(msg.utf8Data)
            })

            stream.on('error', function(err) {
                console.error(err)
            });

            stream.on('end', function() {
                console.log('stream END ')
            });
        });
    });
}