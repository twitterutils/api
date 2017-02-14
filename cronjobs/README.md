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
cat > gen_containerInfo.json <<EOL
{
    "Image": "camilin87/twitterutils_cronjobs:latest",
    "Name": "twu-cron"
}
EOL

docker run --rm -d --name docker-scrapy-cron                  \
  -v /var/run/docker.sock:/var/run/docker.sock                \
  -v $PWD/gen_containerInfo.json:/usr/src/containerInfo.json  \
  --env-file=.env-prod                                        \
  camilin87/docker-cron
```
