# Twitter Utils Api  

The ubiquitous Api... until it needs to be broken down in pieces

## Api - Usage

All the `POST` methods expect the `Content-Type` header set to `application/json`.  

### Login - Twitter Login
Authenticates Twitter users and stores their OAuth tokens to be used by [3-legged apps](https://dev.twitter.com/oauth/3-legged)

1. **Request a login**  
    The API requires a callback that will be invoked after the login operation finishes.  
    ```
    GET /secure/login/api/v1/login?callback=http://<YOUR_WEBSITE>/callback
    ```
2. **Success**  
    On success the API will invoke the callback with the authenticated `user_id`
    ```
    GET http://<YOUR_WEBSITE>/callback?user_id=<TWITTER_USER_ID>&screen_name=<TWITTER_USER_NAME>
    ```
3. **Error**  
    On error the API will invoke the callback with the `error` details.  
    ```
    GET http://<YOUR_WEBSITE>/callback?error=<ERROR_DESCRIPTION>
    ```

For more infomation on how to consume the Login API visit [Twitter Utils Login](https://github.com/twitterutils/logingui).

## Secure Api - Usage

Every method in the secure api expects a `SECRET_API_KEY` in the `Authorization` header in order to prevent abuse.

### Login - Users
Retrieves the list of authenticated users.

**Request**  

    GET /secure/login/api/v1/users/

**Response**  

```json
[
    {"id":"29893096","user_name":"camilin87"},
    {"id":"3044090736","user_name":"TddApps"}
]
```

**curl**  

    curl 'http://localhost:8080/secure/login/api/v1/users' -H 'Authorization: SECRET_API_KEY'

### Login - User Details
Retrieves the authentication credentials for the specified `user_id`.

**Request**  

    GET http://localhost:8080/secure/login/api/v1/user/<user_id>/

**Response**  

```json
{
    "oauth_access_token": "XXXXXXXXXXXXXXXXXXXX",
    "oauth_access_token_secret": "XXXXXXXXXXXXXXXXXXXX"
}
```

**curl**  

    curl 'http://localhost:8080/secure/login/api/v1/user/29893096' -H 'Authorization: SECRET_API_KEY'


### Login - Disable  
Disables the specified `user_id`.

**Request**  

    POST http://localhost:8080/secure/login/api/v1/disable

Body

    { "userid": "2746028153" }

**Response**  

    { "success": true }

**curl**  

    curl 'http://localhost:8080/secure/login/api/v1/disable' -H 'Content-Type: application/json' -H 'Authorization: SECRET_API_KEY' -X POST -d' {"userid": "2746028153"}'

### Graph - User Details  
Retrieves the most recent graph details for the specified `user_id`.

**Request**  

    GET http://localhost:8080/secure/graph/api/v1/user/<user_id>/

**Response**  

```json
{
    "id":"29893096",
    "graphId":"2906dc00-1e93-11e6-ba09-5770dd45e32a",
    "userName":"camilin87",
    "friends":[241007239,...,52146755],
    "followers":[3364453882,...,97104127]
}
```

**curl**  

    curl 'http://localhost:8080/secure/graph/api/v1/user/29893096' -H 'Authorization: SECRET_API_KEY'

### Graph - Graph Details  
Retrieves the graph details for the specified `graph_id`.

**Request**  

    GET http://localhost:8080/secure/graph/api/v1/graph/<graph_id>/

**Response**  

```json
{
    "id":"29893096",
    "graphId":"2906dc00-1e93-11e6-ba09-5770dd45e32a",
    "userName":"camilin87",
    "friends":[241007239,...,52146755],
    "followers":[3364453882,...,97104127]
}
```

**curl**  

    curl 'http://localhost:8080/secure/graph/api/v1/graph/7e0d64a0-3868-11e6-ab2b-25ecfcf673fe' -H 'Authorization: SECRET_API_KEY'

### Graph - User Changes  
Retrieves the sorted list of **ALL** the changes related to the specified `user_id`.

**Request**  

    GET http://localhost:8080/secure/graph/api/v1/changes/<user_id>/

**Response**  

```json
[
    {"type":"friend","originator":"29893096","target":9526722,"prevId":"e62feea0-1bcf-11e6-926c-67cf9ffda0f3","currId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc"},
    {"type":"follow","originator":2252762718,"target":"29893096","prevId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc","currId":"5f3609d0-1c05-11e6-b694-7149e79175e6"},
    {"type":"unfollow","originator":695568104479465500,"target":"29893096","prevId":"5f3609d0-1c05-11e6-b694-7149e79175e6","currId":"f1ab83b0-1c11-11e6-b267-97e899511e61"},
    {"type":"unfollow","originator":4474917977,"target":"29893096","prevId":"f1ab83b0-1c11-11e6-b267-97e899511e61","currId":"415c3a20-1cf4-11e6-8bb0-8f7cc4c5920c"}
]
```

**curl**  

    curl 'http://localhost:8080/secure/graph/api/v1/changes/29893096' -H 'Authorization: SECRET_API_KEY'

### Graph - Recent Changes  

Retrieves the sorted list of the changes **AFTER** the specified `graph_id` as long as they are related to the same user.

**Request**  

    GET http://localhost:8080/secure/graph/api/v1/recentchanges/<graph_id>/

**Response**  

```json
[
    {"type":"unfollow","originator":695568104479465500,"target":"29893096","prevId":"5f3609d0-1c05-11e6-b694-7149e79175e6","currId":"f1ab83b0-1c11-11e6-b267-97e899511e61"},
    {"type":"unfollow","originator":4474917977,"target":"29893096","prevId":"f1ab83b0-1c11-11e6-b267-97e899511e61","currId":"415c3a20-1cf4-11e6-8bb0-8f7cc4c5920c"},
    {"type":"unfollow","originator":17850785,"target":"29893096","prevId":"415c3a20-1cf4-11e6-8bb0-8f7cc4c5920c","currId":"72638250-1cf8-11e6-8d3b-db866daacc7f"},
    {"type":"follow","originator":718019125638012900,"target":"29893096","prevId":"72638250-1cf8-11e6-8d3b-db866daacc7f","currId":"4fb11170-1d37-11e6-aae4-856a3d6ecb3a"}
]
```

**curl**  

    curl 'http://localhost:8080/secure/graph/api/v1/recentchanges/7e0d64a0-3868-11e6-ab2b-25ecfcf673fe' -H 'Authorization: SECRET_API_KEY'

### Notifications - Send Notification  
Sends a notification to the specified `user_id`.

**Request**  

    POST http://localhost:8080/secure/notifications/api/v1/send

Body

```json
{
    "type": "unfollow",
    "userid": "29893096",
    "details": {
        "target": 9526722
    }
}
```

**Response**  

    { "success": true }

**curl**  

    curl 'http://localhost:8080/secure/notifications/api/v1/send' -H 'Content-Type: application/json' -H 'Authorization: SECRET_API_KEY' -X POST -d' {"type": "unfollow", "userid": "29893096", "details": {"target": 9526722}}'

### Feed - Recent Notifications  

Retrieves the sorted list of the most recent notifications for a user.

**Request**  

    GET http://localhost:8080/secure/feed/api/v1/recentnotifications/<user_id>/<max_count>/

**Response**  

```json
[
    {"id":"576c82ad6a14de2400ea4dfe","type":"unfollow","userId":"29893096","details":{"target":3044090736}},
    {"id":"5773f0938583b42400868cbb","type":"unfollow","userId":"29893096","details":{"target":4847284508}}
]
```

**curl**  

    curl 'http://localhost:8080/secure/feed/api/v1/recentnotifications/29893096/2' -H 'Authorization: SECRET_API_KEY'

### Usernames - List  

Retrieves a list of usernames for the specified comma-separated user ids.  

**Request**  

    GET http://localhost:8080/secure/usernames/api/v1/find/<user_id1>,<user_id2>,<user_idn>

**Response**  

```json
[
    {
        "userId": "2746028153",
        "userName": "RainDna"
    },
    {
        "userId": "50457174",
        "userName": "cashproductions"
    }
]
```

**curl**  

    curl 'http://localhost:8080/secure/usernames/api/v1/find/2746028153,50457174' -H 'Authorization: SECRET_API_KEY'

### Schedule - Update  
Disables the specified `user_id`.

**Request**  

    POST http://localhost:8080/secure/schedule/api/v1/updateuser

Body

    { "userid": "2746028153" }

**Response**  

    { "success": true }

**curl**  

    curl 'http://localhost:8080/secure/schedule/api/v1/updateuser' -H 'Content-Type: application/json' -H 'Authorization: SECRET_API_KEY' -X POST -d' {"userid": "2746028153"}'

### Schedule - List  

Retrieves a list of the userIds to be crawled.  

**Request**  

    GET http://localhost:8080/secure/schedule/api/v1/list/

**Response**  

```json
[
    "2746028153",
    "50457174"
]
```

**curl**  

    curl 'http://localhost:8080/secure/schedule/api/v1/list' -H 'Authorization: SECRET_API_KEY'

## Development
    npm run dev

### Settings File
The application will read its environment variables from `.env`. This file is not in source control. Therefore it is sane to keep it in a backed up location.

    ln -s ~/<PATH_TO_ACTUAL_UTILS_FILE>/twitter_utils_api_env.txt .env

### Seeding the Database  

Open a mongo shell and create the `db_status` collection with an item.  

```js
use twu_api_db2
db.db_status.insert({ operational: true })
```
