# api
The ubiquitous Api... until it needs to be broken down in pieces

## Api Usage

### Twitter Login
Authenticates Twitter users and stores their OAuth tokens to be used by [3-legged apps](https://dev.twitter.com/oauth/3-legged)

1. **Request a login**  
    The API requires a callback that will be invoked after the login operation finishes.  
    ```
    GET /login/api/v1/login?callback=http://<YOUR_WEBSITE>/callback
    ```
2. **Success**  
    On success the API will invoke the callback with the authenticated `user_id`
    ```
    GET http://<YOUR_WEBSITE>/callback?user_id=<TWITTER_USER_ID>
    ```
3. **Error**  
    On error the API will invoke the callback with the `error` details.  
    ```
    GET http://<YOUR_WEBSITE>/callback?error=<ERROR_DESCRIPTION>
    ```

For more infomation on how to consume the Login API visit [Twitter Utils Login](https://github.com/twitterutils/logingui).

### Users
Retrieves the list of authenticated users. It expects a `SECRET_API_KEY` in order to prevent abuse.

**Request**  

```
GET /login/api/v1/users/
```

Headers

```
Authorization: SECRET_API_KEY
```

Here's the curl equivalent

```sh
curl 'http://localhost:8080/login/api/v1/users' -H 'Authorization: SECRET_API_KEY'
```


**Response**  

```json
[{"id":"29893096","user_name":"camilin87"},{"id":"3044090736","user_name":"TddApps"}]
```

### User Details
Retrieves the authentication credentials for the specified `user_id`. It expects a `SECRET_API_KEY` in order to prevent abuse.

**Request**  

```
GET http://localhost:8080/login/api/v1/user/<user_id>/
```

Headers

```
Authorization: SECRET_API_KEY
```

Here's the curl equivalent

```sh
curl 'http://localhost:8080/login/api/v1/user/29893096' -H 'Authorization: SECRET_API_KEY'
```


**Response**  

```json
{"oauth_access_token":"supersecret","oauth_access_token_secret":"extrasecret"}
```

## Development
    npm run dev

### Settings File
The application will read its environment variables from `.env`. This file is not in source control. Therefore it is sane to keep it in a backed up location.

    ln -s ~/<PATH_TO_ACTUAL_UTILS_FILE>/twitter_utils_api_env.txt .env

## Infrastructure  
- nodejs
- heroku
- mongolabs
- loggly

