# main-server

Before starting docker-compose, create a docker bridge network
``` docker network create -d bridge executeit```

Then start traefik `docker-compose -f docker-compose.dev.yml up -d reverse-proxy`

And finally start the server `docker-compose -f docker-compose.dev.yml up app`