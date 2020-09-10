const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const WebSocketServer = require('websocket').server;

const Docker = require('dockerode')

const processOutput = require('./processOutput')

const docker = new Docker({socketPath: "/var/run/docker.sock"})

const app = express();

app.use(cors())
app.use(bodyParser.json());

const server = app.listen(8888, ()=>console.log("Listening on 8888"))

const wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false})

wsServer.on('request', function(request) {
    const connection = request.accept('terminal-connect', request.origin);
    runExec(connection, "6e28872000bc")
})

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