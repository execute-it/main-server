const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const bodyParser = require('body-parser')

const Docker = require('dockerode')

const demux = require('./demux')

const docker = new Docker({socketPath: "/var/run/docker.sock"})

const app = express();

app.use(cors())
app.use(bodyParser.json());

expressWs(app);

app.ws('/terminals', (ws, req)=>{
    // ws.send("welcome")
    runExec(ws, "e7a3d0d08957")
})

app.listen(8888, ()=>console.log("Listening on 8888"))

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

            demux(stream, ws)

            ws.on('message', (msg)=>{
                stream.write(msg)
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