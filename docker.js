var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var auxContainer;
docker.createContainer({
    Image: 'nginx:alpine',
    name: 'hello',
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    "ExposedPorts": {
        "80/tcp": {}
    },
    "PortBindings":{"80/tcp":[{"HostIp":"","HostPort":"7000"}]},
    OpenStdin: false,
    StdinOnce: false
}).then(function (container) {
    auxContainer = container;
    return auxContainer.start();
}).then(function (data) {
    return auxContainer.resize({
        h: process.stdout.rows,
        w: process.stdout.columns
    });
}).then(function (data) {
    // return auxContainer.stop();
}).then(function (data) {
    // return auxContainer.remove();
}).then(function (data) {
    console.log('container removed');
}).catch(function (err) {
    console.log(err);
});