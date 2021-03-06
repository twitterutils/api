# cronjobs  

all the cronjobs in a single repo

## Settings File  
The application will read its environment variables from `.env`. This file is not in source control. Therefore it is sane to keep it in a backed up location.

    ln -s ~/<PATH_TO_ACTUAL_UTILS_FILE>/cronjobs_env.txt .env

## Dev  

Build the container  

    docker build -t camilin87/twitterutils_cronjobs .

Generate the production environment file

    rake env

Run the container  

    docker run --rm --name twu-cronjobs \
        --env-file=.env-prod \
        camilin87/twitterutils_cronjobs

Run it as a cron  

```bash
# these instructions are Docker 1.13 only
# run the cron locally  
docker run --rm -d --name twu-cron-scheduler                  \
  -v /var/run/docker.sock:/var/run/docker.sock                \
  --env-file=.env-prod                                        \
  camilin87/twitterutils_cronjobs_scheduler

# run the cron as a swarm service
docker service create \
  --replicas 1 \
  --name twu-cron-scheduler \
  --env-file=.env-prod \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  camilin87/twitterutils_cronjobs_scheduler

# for Docker 1.12 use the contents of the .env-prod-cmd file as environment parameters
```
