*Realtime Code Collaboration and Code Execution Platform*
# Execute-It Main server

Main server for managing all the services in the project.
![ezgif com-gif-maker](https://user-images.githubusercontent.com/39241098/114086565-616bb400-98d0-11eb-91ce-37a16ce1630d.gif)

## Prerequisites

This project is built on top of docker containers. So ensure that you have
Docker and Docker Compose installed on your system For installation
instructions refer: https://docs.docker.com/install/


## Starting the Server

Before starting docker-compose, create a docker bridge network
```bash 
docker network create -d bridge executeit
```


Then start traefik 
```bash
docker-compose -f docker-compose.dev.yml up -d reverse-proxy
```

And finally start the server 
```bash
docker-compose -f docker-compose.dev.yml up app
```

## System Architecture

![System_Architecture](https://user-images.githubusercontent.com/49340051/113477998-adb78e00-94a3-11eb-9f44-803ac84b8c24.png)



