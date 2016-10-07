# cronjobs  

[![Build Status](https://travis-ci.org/twitterutils/cronjobs.svg?branch=master)](https://travis-ci.org/twitterutils/cronjobs)  

all the cronjobs in a single repo

## Settings File  
The application will read its environment variables from `.env`. This file is not in source control. Therefore it is sane to keep it in a backed up location.

    ln -s ~/<PATH_TO_ACTUAL_UTILS_FILE>/cronjobs_env.txt .env

## Development  

**Build the container**  

```sh
docker build -t camilin87/twitterutils_cronjobs .
```
**Run the container**

```sh
docker run \
    --env-file=.env \
    -e NPM_COMMAND='devpublic' \
    -it camilin87/twitterutils_cronjobs
```

Substitute `devpublic` with the desired `npm` command  


## Infrastructure  
- nodejs
- dockercloud
- mongolabs
- cloudwatch

