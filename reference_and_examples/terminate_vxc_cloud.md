
# Characteristics:
- Characterisitc Fields allowed for the order and the O/M status


| Field | O/M | Type | Example Values | Description |
| :---- | ----- | :---- | :---- | :---- |
| remark | M | String | \- | \- |
| externalId | M | String | 03536617-56fa-4d72-86f0-e51ba1669886 | Top order level id |
| inventoryId | String | M |  | Sent as service.Id (not in characteristics) |
| state | M | String | Terminated | Service lifecycle status (e.g., Terminated) |



```json
{
    "header":
    {
        "initMethod": "POST",
        "version": "5.0",
        "timestamp": "2025-10-08T00:00:33Z",
        "orgService": "BWC",
        "from": "NSB",
        "channel": "",
        "broker": "",
        "useCase": "",
        "useCaseStep": "",
        "useCaseAge": 0,
        "functionName": "",

        // Should be random:
        "session": "session-d991-4ddb-b250-4bd11967fcf6",
        // Should be same as session:
        "transaction": "466a7e72-d991-4ddb-b250-4bd11967fcf6",
        "communication": "unicast",
        "groupTags":
        [],
        "identity":
        {
            "device":
            [],
            "public": "",
            "user": "cluster1"
        },
        "token": "",
        "initUri": "",
        "queryParam": "",
        "tmfSpec": "none",
        "baseApiVersion": "none",
        "schemaVersion": "none",
        "instanceData": "",
        "scope": "global",
        "agent": "",
        "useCaseStartTime": "",
        "useCaseExpiryTime": ""
    },
    "body": {

  // Reference that will be sent to SSS for orderRef
  "externalId": "03536617-56fa-4d72-86f0-e51ba1669886",
  "description": "Some description from SSS about the Order",

  "category": "ConnectX",

  "serviceOrderItem":
  [
      {
          // ID number of the orderItem, will be incremental numeric: 1, 2, 3..
          "id": "1",

          // Action is modify because we are modifying an existing inventory:
          "action": "modify",


          "service": {

            // This is the inventory id of the Service we are trying to modify:
            "id": "<inventory id>",

            // State will be terminated:
            "state": "terminated",
            "@type": "Service"
          },
          "@type": "ServiceOrderItem"
    }
  ]
}


}
```