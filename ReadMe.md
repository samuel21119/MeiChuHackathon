# Server backend

## LIFF ID
GET: `/liff-id`
Return value:
```json
{
    "id": LIFF_ID
}
```

## Webpage Dir

`/webpage`

## Create event
### HTML page
GET: `/create-event`  

### Submit   
POST: `/create-event`  
Return value: event code  

## Signup
### HTML page
GET: `/signup-event/EVENT_CODE`  

### Get event details
GET: `/signup-event/api/EVENT_CODE`  
Return value:   

```json
{
    "time": "20201024",
    "title": "???",
    "description": "???",
    "question": ["Q1", "Q2", "Q3"]
}
```

### Submit
POST: `/signup-event/api/EVENT_CODE`  
```
{
    "userID": "???",
    "question": {
        "Q1": "A1",
        "Q2": "A2",
        "Q3": "A3"
    }
}
```
Return value: "success" or "failed"  

## Query
Get user's event.  

### Get data
GET: `/query-user-event/?userID=`  
Return value: sorted by time  
```json
[
    {
        "id": "???",
        "time": "???",
        "title": "???",
        "description":"???"
    },
    {
        "id": "???",
        "time": "???",
        "title": "???",
        "description":"???"
    }
]
```
