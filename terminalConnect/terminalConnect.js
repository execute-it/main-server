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

        const containerId = pathParams[1]

        isContainerValid(pathParams[1], (err)=>{
            if(err){
                // Given container does not exist
                request.reject()
                return
            }

            const connection = request.accept('terminal-connect', request.origin);

            runExec(connection, containerId);
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
        Detach: true,
        Tty: true,
    };

    docker.getContainer(containerId).exec(options, function(err, exec) {
        if (err){
            console.error("Error", err)
            return;
        }

        exec.start({stdin: false, hijack: true}, function(err, stream) {
            if (err){
                console.error(err);
                return;
            }

            processOutput(stream, ws)

            ws.on('message', (msg)=>{
                // xterm attach sends plain text for terminal data.
                // So, if msg data is JSON, it's a message sent by our code else sent by xterm
                if(isJSON(msg.utf8Data))
                    handleSystemMsg(msg.utf8Data, exec, ws);
                else
                    stream.write(msg.utf8Data)
            })

            stream.on('error', function(err) {
                console.error(err)
            });

            stream.on('end', function() {

            });

            ws.on('close', ()=>{
                // exec.inspect().then(data=>console.log("Exec PID:", data.Pid))
                stream.destroy()
                stream.end()
            })
        });

    });
}

function isJSON(str) {
    try{
        JSON.parse(str)
        // JSON.parse parses numbers successfully so check if string is like {...}
        return str.startsWith("{") && str.endsWith("}");
    } catch (e) {
        return false
    }
}

function handleSystemMsg(msg, exec, ws) {
    const msgJSON = JSON.parse(msg);
    switch (msgJSON.type) {
        case "ping":
            ws.send("")
            break;
        case "resize":
            exec.resize({w: parseInt(msgJSON.payload.cols), h: parseInt(msgJSON.payload.rows)})
            break;
    }
}