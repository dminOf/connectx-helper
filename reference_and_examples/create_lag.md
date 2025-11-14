
# Characteristics:


| Field | O/M | Type | Example Values | Description |
| :---- | :---: | :---- | :---- | :---- |
| externalId | M | String | "ABCD123" | Top level external id reference from SSS |
| nonMobileNo | M | String | Non mobile No. EX. 9000111111 | Customer's non-mobile number |
| customerName | M | String | Customer Link Name EX. เมืองไทยแคปปิตอลสาขาสำนักงานใหญ่ | Example data from connect MTC\_port\_1\_tls\_to\_ABC\_SILA |
| caNo | M | String | Customer Account No. EX. C230065571 | Customer billing no., Ref SSS |
| customerAccountName | M | String | Customer Account Name EX. เมืองไทย แคปปิตอล | Customer billing account name Ref SSS |
| cableType | M | String | ระบุ Cable Type Ex. Main | Used to identify cable type. Main Backup |
| nonMobileMain | O | String | ระบุเลข Nonmboile main | Used to identify non-mobile numbers. (Required if cableType \= Backup) |
| customerSiteCode | M | String | Customer site code EX. CX\_123456 | Customer branch code If required, AWN lastmile must be created in the site master system. |
| bandwidth | ~~M~~ | String | Bandwidth EX. 50M | Bandwidth specifying units M,G |
| dcLocation | M | String | DC Location EX. STTT3 | Data Center Location The planning team must provide the abbreviation for each data center. |
| dcLocationHostNonmobile | O | String | SILA | ระบุเลข nonmobile implement service over ฝั่ง host (require if connectXSolution \= vxc Order or cloud) |
| portType | M | String | port type EX. 1G,10G,100G | Port that customers purchase at the device |
| isDiversity | O | boolean | is Diversity Ex. true, false | Specify whether it is port diversity or not. |
| diversityNonmobile | O | String | ระบุเลข nonmobile | The name of connect x switch node (PORT, LAG) |
| lagNumber | O | String | Lag number Ex. 2 min 1 \- max 8 | Number of ports to be lag-enabled (required for is Lag \= true) |
| serviceVlanType | M | String | Service Vlan Type Ex.dot1q, access,qinq | Use to specify values: \- dot1q \- access \- qinq |
| networkServiceType | M | String | network service type ex. L2VPN | Specify the network service type: \- L2VPN \- L3VPN \- L3VPN-INTERNET |



# Order Format:

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
    "body":
    {
        // Should be random:
        "externalId": "03536617-56fa-4d72-86f0-e51ba1669886",
        "description": "Some description from SSS about the Order",
        "category": "ConnectX",
        "requestExecutionDate": "30-10-2025 00:00:00",
        "serviceOrderItem":
        [
            {
                "id": "1",
                "action": "add",
                "service":
                {
                    "name": "CFS_ConnectX_LAG",
                    "serviceType": "CFS",
                    "state": "reserved",
                    "serviceCharacteristic":
                    [
                        {
                            "name": "nonMobileNo",
                            "value": "9000111110-05",
                            "@type": "StringCharacteristic"
                        },
                        {
                            "name": "nonMobileMain",
                            "value": "9000111110-05",
                            "@type": "StringCharacteristic"
                        },


                   // (...other fields in the same way...)
                   // @types are : StringArrayCharacteristic, BooleanCharacterisc etc.
                    ],
                    "serviceSpecification":
                    {
                        "id": "CFSS_ConnectX_LAG",
                        "name": "CFSS_ConnectX_LAG",
                        "@type": "ServiceSpecificationRef",
                        "@referredType": "CustomerFacingServiceSpecification"
                    },
                    "relatedParty":
                    [
                        {
                            "role": "Customer",
                            "@type": "RelatedPartyRefOrPartyRoleRef",
                            "partyOrPartyRole":
                            {
                                "id": "C230065571",
                                "name": "เมืองไทย แคปปิตอล",
                                "@type": "PartyRoleRef",
                                "@referredType": "Customer"
                            }
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
