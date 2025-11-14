

| Field | O/M | Type | Example Values | Description |
| :---- | :---: | ----- | :---- | :---- |
| externalId | M | String |  | External ID Reference from SSS |
| nonMobileNo | M | String | Non mobile No. EX. 9000111111 | Customer’s Non-Mobile number. |
| customerName | M | String | Customer Link Name EX. เมืองไทยแคปปิตอลสาขาสำนักงานใหญ่ | Example data from Connect: MTC\_port\_1\_tls\_to\_ABC\_SILA |
| caNo | M | String | Customer Account No. EX. C230065571 | Customer billing number or SSS reference. |
| customerAccountName | M | String | Customer Account Name EX. เมืองไทย แคปปิตอล | Billing account name of the customer as referenced in SSS. |
| cableType | M | String | Specify the cable type. Ex. Main | Used to specify the cable type. Values: Main, Backup |
| nonMobileMain | O | String | Specify the Nonmobile main number | Specify the Non-Mobile number. (Required if cableType \= Backup) |
| customerSiteCode | M | String | Customer site code EX. CX\_123456 | Customer branch/site code. (Required when AWN last-mile connection is needed; must be created in Site Master system.) |
| bandwidth | M | String | Bandwidth EX. 50M | Bandwidth in Mbps or Gbps. |
| dcLocation | M | String | DC Location EX. STTT3 | Location of the data center. The planning team will provide the abbreviations for each data center. |
| dcLocationHostNonmobile | O | String | eDC Location EX. SILA | Specify the Non-Mobile number used for “implement service over” on the host side. (Required if connectXSolution \= VXC Order or Cloud) |
| portType | M | String | port type EX. 1G,10G,100G | Port purchased by the customer on the device. |
| serviceVlanType | M | String | Service Vlan Type Ex.dot1q, access,qinq | Specify VLAN type: \- dot1q \- access \- qinq |
| implementServiceOver | M | String | implment service over ex. new customer port | Specify type of service implementation: \-New customer port \-Existing customer port |
| nonMobileImplementServiceOver | M | String | non mobile implement service over ex. 9000111222 | Specify Non-Mobile number for service over: – For New customer port: specify the current number. – For Existing customer port: specify the Non-Mobile number to be over (Terminal side). |
| networkServiceType | M | String | network service type ex. L2VPN | Specify the network service type: \- L2VPN \- L3VPN \- L3VPN-INTERNET |


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

            // Because we are creating a new port the action of the order will be 'add'            
            "action": "add",
            "service":
            {
                "name": "CFS_ConnectX_VXC",
                "serviceType": "CFS",

                "serviceCharacteristic":
                [
                    {
                        "name": "nonMobileNo",
                        "value": "9000111111",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "customerName",
                        "value": "เมืองไทยแคปปิตอลสาขาสำนักงานใหญ่",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "caNo",
                        "value": "C230065571",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "customerAccountName",
                        "value": "เมืองไทย แคปปิตอล",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "cableType",
                        "value": "Main",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "nonMobileMain",
                        "value": "xxx",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "customerSiteCode",
                        "value": "CX_123456",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "bandwidth",
                        "value": "50M",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "dcLocation",
                        "value": "STTT3",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "dcLocationHostNonmobile",
                        "value": "SILA",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "portType",
                        "value": "10G",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "serviceVlanType",
                        "value": "dot1q",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "implementServiceOver",
                        "value": "new customer port",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "nonMobileImplementServiceOver",
                        "value": "9000111222",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "networkServiceType",
                        "value": "L2VPN",
                        "@type": "StringCharacteristic"
                    },
                   {
                        "name": "VlanHost",
                        "value": "a1234",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "VlanTerminal",
                        "value": "b1234",
                        "@type": "StringCharacteristic"
                    },                    {
                        "name": "VlanCloud",
                        "value": "c1234",
                        "@type": "StringCharacteristic"
                    },
                    {
                        "name": "PathPanel",
                        "value": "d1234",
                        "@type": "StringCharacteristic"
                    }
                ],
                "serviceSpecification":
                {
                    "id": "CFSS_ConnectX_VXC",
                    "name": "CFSS_ConnectX_VXC",
                    "@type": "ServiceSpecificationRef",
                    "@referredType": "CustomerFacingServiceSpecification"
                },
                "relatedParty":
                [
                    {
                        // This will be the reference of the customer also:
                        "role": "Customer",
                        "@type": "RelatedPartyRefOrPartyRoleRef",
                        "partyOrPartyRole":
                        {
                            // This will be the caId                            
                            "id": "C230065571",
                            // This will be the customerAccountName:
                            "name": "เมืองไทย แคปปิตอล",
                            "@type": "PartyRoleRef",
                            "@referredType": "Customer"
                        }
                    }                ],
                "@type": "Service"
            },
            "@type": "ServiceOrderItem"
        }
    ]
}
```