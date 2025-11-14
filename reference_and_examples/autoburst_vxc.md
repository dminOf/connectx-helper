

# Characteristics:
- Characterisitc Fields allowed for the order and the O/M status


| Field | Type | O/M | Values | Description |
| :---- | :---: | :---: | :---- | :---- |
| burstOrderType | String | M | Order Type: UP มีค่าทั้งหมดตามด้านล่าง UP (Up Speed) DP (Down Speed) |  |
| burstEffectiveDate | String | M | Effective Date format: 2025-10-08  |  |
| burstEndDate | String | O | End Date format: 2025-10-08 End Date |  |
| inventoryId | String | M |  | Sent as service.Id (not in characteristics) |
| bustLinkSpeed | String | M |  |  |




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
    "serviceOrderItem": [
        {
            // ID number of the orderItem, will be incremental numeric: 1, 2, 3..
            "id": "1",

            // Request will be modify:
            "action": "modify",
            "service":
            {

                // Actual inventory ID for this inventory:
                "id": "<inventory id>",
                "serviceCharacteristic":
                [

                    // Possible values are UP and DP
                    {
                        "name": "burstOrderType",
                        "value": "UP",
                        "@type": "StringCharacteristic"
                    },

                    // The expected speed by the user -- [Mbps,Kbps,Gbps]
                    {
                        "name": "bustLinkSpeed",
                        "value": "1024 Mbps",
                        "@type": "StringCharacteristic"
                    },


                    // The expected setting on GCP
                    // LINK_TYPE_ETHERNET_10G_LR, LINK_TYPE_ETHERNET_100G_LR or LINK_TYPE_ETHERNET_400G_LR4
                    // Ref: https://cloud.google.com/compute/docs/reference/rest/v1/interconnects/patch
                    {
                        "name": "gcpLinkType",
                        "value": "LINK_TYPE_ETHERNET_10G_LR",
                        "@type": "StringCharacteristic"
                    },

                    // Date since when the
                    {
                        "name": "burstEffectiveDate",
                        "value": "12-09-2025",
                        "@type": "StringCharacteristic"
                    },
                    // End date
                    {
                        "name": "burstEndDate",
                        "value": "31-12-2999",
                        "@type": "StringCharacteristic"
                    }

                ],
                "@type": "Service"
            },
            "@type": "ServiceOrderItem"
        }
    ]
}


}
```