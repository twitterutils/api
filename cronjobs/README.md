# cronjobs  

all the cronjobs in a single repo

## Settings File  
The application will read its environment variables from `.env`. This file is not in source control. Therefore it is sane to keep it in a backed up location.

    ln -s ~/<PATH_TO_ACTUAL_UTILS_FILE>/cronjobs_env.txt .env

## Dev  

Build the container  

    docker build -t camilin87/twitterutils_cronjobs .

Run the container  

    docker run --rm --name twu-cronjobs \
        --env-file=.env camilin87/twitterutils_cronjobs

