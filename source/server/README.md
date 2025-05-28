# API
## User:
### *Get*: 
* API : `http://localhost:8007/api/user/{:uuid}`
* Params:  {:uuid}
* Response: User
Example: 
``` json 
[
    {
        "uuid": "8b1a8b19-d14b-4b35-ae83-6f72e3089a7a",
        "username": "test huynh minh tri",
        "password": "123456000",
        "created_at": "2024-05-27T11:34:48.000Z",
        "updated_at": null,
        "deleted_at": null
    }
]
```

### *Post*: 
* API : `http://localhost:8007/api/user/register`
* Body:
``` json
{
    "username": "test huynh minh tri",
    "password" : "123456000"
}
```
* Response: User
Example: 
``` json 
{
    "uuid": "14d1e898-7ecb-4347-982d-c9fe82884135",
    "username": "test huynh minh tri",
    "password": "123456000",
    "created_at": "2024-05-27T11:36:06.831Z"
}
```
--------------------------------------------------------------------
## History:
### *Get*: 
* API : `http://localhost:8007/api/history/{:uuid}`
* Params:  {:uuid}
* Response: User
Example: 
``` json 
[
    {
        "uuid": "3edc8ad9-99e2-4066-94a3-23d85a7d39ae",
        "created_at": "2024-05-27T11:19:01.000Z",
        "updated_at": null,
        "deleted_at": null,
        "user_uuid": "5189764b-a656-4608-9691-7ae69a637a91"
    }
]
```

### *Post*: 
* API : `http://localhost:8007/api/history/save`
* Body:
``` json
{
    "user_uuid": "8b1a8b19-d14b-4b35-ae83-6f72e3089a7a"
}
```
* Response: User
Example: 
``` json 
{
    "uuid": "28fec6d7-1a5c-4125-a245-c5b8c97aeeb9",
    "created_at": "2024-05-27T11:38:59.807Z",
    "user_uuid": "8b1a8b19-d14b-4b35-ae83-6f72e3089a7a"
}
```
------------------------------------------------------------------
## Logs:
### *Get*: 
* API : `http://localhost:8007/api/log/{:uuid}`
* Params:  {:uuid}
* Response: User
Example: 
``` json 
[
    {
        "uuid": "777ba53c-3988-4955-bbb2-77dede7bd66d",
        "number_sentence": 1,
        "sentences": "this is a conversation",
        "history_uuid": "28fec6d7-1a5c-4125-a245-c5b8c97aeeb9",
        "created_at": "2024-05-27T11:49:52.000Z",
        "updated_at": null,
        "deleted_at": null
    }
]
```

### *Post*: 
* API : `http://localhost:8007/api/log/save`
* Body:
``` json
{
    "number_sentence": "1",
    "sentences" : "this is a conversation",
    "history_uuid" : "28fec6d7-1a5c-4125-a245-c5b8c97aeeb9"
}
```
* Response: User
Example: 
``` json 
{
    "uuid": "777ba53c-3988-4955-bbb2-77dede7bd66d",
    "number_sentence": "1",
    "sentences": "this is a conversation",
    "history_uuid": "28fec6d7-1a5c-4125-a245-c5b8c97aeeb9",
    "created_at": "2024-05-27T11:49:52.010Z"
}
```
