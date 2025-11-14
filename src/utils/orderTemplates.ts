// Order Templates System
// Maps form fields to JSON order structure

export interface OrderField {
  name: string;
  mandatory: boolean;
  type: string;
  example: string;
  description: string;
  topLevel?: boolean; // If true, field goes to top level of body/service, not in characteristics
}

export interface OrderTemplate {
  type: string; // e.g., "create_port", "terminate_port"
  fields: OrderField[];
  serviceType: string; // e.g., "CFS_ConnectX_Port"
  specId: string; // e.g., "CFSS_ConnectX_Port"
  action: string; // "add" or "modify"
  isTermination?: boolean; // true for terminate operations, false/undefined for modify operations
}

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get current timestamp
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Helper function to format date as DD-MM-YYYY HH:mm:ss
function formatRequestDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Helper function to get @type based on field type
function getCharacteristicType(fieldType: string): string {
  switch (fieldType.toLowerCase()) {
    case 'boolean':
      return 'BooleanCharacteristic';
    case 'stringarray':
    case 'array':
      return 'StringArrayCharacteristic';
    case 'int':
    case 'integer':
    case 'number':
      return 'IntegerCharacteristic';
    default:
      return 'StringCharacteristic';
  }
}

// Generate order JSON from template and field values
export function generateOrderJSON(template: OrderTemplate, fieldValues: Record<string, any>): any {
  const sessionId = generateUUID();
  const externalId = fieldValues.externalId || generateUUID();

  const order: any = {
    header: {
      initMethod: 'POST',
      version: '5.0',
      timestamp: getCurrentTimestamp(),
      orgService: 'BWC',
      from: 'NSB',
      channel: '',
      broker: '',
      useCase: '',
      useCaseStep: '',
      useCaseAge: 0,
      functionName: '',
      session: sessionId,
      transaction: sessionId,
      communication: 'unicast',
      groupTags: [],
      identity: {
        device: [],
        public: '',
        user: 'cluster1'
      },
      token: '',
      initUri: '',
      queryParam: '',
      tmfSpec: 'none',
      baseApiVersion: 'none',
      schemaVersion: 'none',
      instanceData: '',
      scope: 'global',
      agent: '',
      useCaseStartTime: '',
      useCaseExpiryTime: ''
    },
    body: {
      externalId: externalId,
      description: fieldValues.description || 'ConnectX Order',
      category: 'ConnectX',
      requestExecutionDate: formatRequestDate(),
      serviceOrderItem: [
        {
          id: '1',
          action: template.action,
          service: {} as any,
          '@type': 'ServiceOrderItem'
        }
      ]
    }
  };

  const service = order.body.serviceOrderItem[0].service;

  // For terminate actions
  if (template.action === 'modify' && template.isTermination) {
    service.id = fieldValues.inventoryId || '';
    service.state = fieldValues.state || 'terminated';
    service.serviceCharacteristic = [];
    service['@type'] = 'Service';

    // Always add externalId as a characteristic
    service.serviceCharacteristic.push({
      name: 'externalId',
      value: externalId,
      '@type': 'StringCharacteristic'
    });

    // Add any additional characteristics for termination (like remark)
    template.fields.forEach(field => {
      if (!field.topLevel && field.name !== 'externalId' && field.name !== 'description') {
        let value = fieldValues[field.name] || field.example;
        if (value !== undefined && value !== '') {
          service.serviceCharacteristic.push({
            name: field.name,
            value: value,
            '@type': getCharacteristicType(field.type)
          });
        }
      }
    });
  }
  // For modify actions (upgrade/downgrade/autoburst)
  else if (template.action === 'modify') {
    service.id = fieldValues.inventoryId || '';
    service.serviceCharacteristic = [];
    service['@type'] = 'Service';

    // Always add externalId as a characteristic
    service.serviceCharacteristic.push({
      name: 'externalId',
      value: externalId,
      '@type': 'StringCharacteristic'
    });

    // Build characteristics for the fields being modified
    template.fields.forEach(field => {
      if (!field.topLevel && field.name !== 'externalId' && field.name !== 'description') {
        let value = fieldValues[field.name] || field.example;
        if (value !== undefined && value !== '') {
          // Parse StringArray values if they're JSON strings
          if (field.type.toLowerCase() === 'stringarray' || field.type.toLowerCase() === 'array') {
            try {
              value = typeof value === 'string' ? JSON.parse(value) : value;
            } catch (e) {
              // If parsing fails, keep as string
            }
          }
          // Convert boolean strings to actual booleans
          else if (field.type.toLowerCase() === 'boolean') {
            value = value === 'true' || value === true;
          }
          service.serviceCharacteristic.push({
            name: field.name,
            value: value,
            '@type': getCharacteristicType(field.type)
          });
        }
      }
    });
  }
  // For create/add actions
  else {
    service.name = template.serviceType;
    service.serviceType = 'CFS';
    service.state = 'reserved';
    service.serviceCharacteristic = [];

    // Always add externalId as a characteristic
    service.serviceCharacteristic.push({
      name: 'externalId',
      value: externalId,
      '@type': 'StringCharacteristic'
    });

    // Build characteristics from fields
    template.fields.forEach(field => {
      if (field.topLevel) {
        // Top-level fields like inventoryId, state go to service level
        if (fieldValues[field.name]) {
          service[field.name] = fieldValues[field.name];
        }
      } else if (field.name !== 'externalId' && field.name !== 'description') {
        // Regular characteristics
        let value = fieldValues[field.name] || field.example;
        if (value !== undefined && value !== '') {
          // Parse StringArray values if they're JSON strings
          if (field.type.toLowerCase() === 'stringarray' || field.type.toLowerCase() === 'array') {
            try {
              value = typeof value === 'string' ? JSON.parse(value) : value;
            } catch (e) {
              // If parsing fails, keep as string
            }
          }
          // Convert boolean strings to actual booleans
          else if (field.type.toLowerCase() === 'boolean') {
            value = value === 'true' || value === true;
          }
          service.serviceCharacteristic.push({
            name: field.name,
            value: value,
            '@type': getCharacteristicType(field.type)
          });
        }
      }
    });

    service.serviceSpecification = {
      id: template.specId,
      name: template.specId,
      '@type': 'ServiceSpecificationRef',
      '@referredType': 'CustomerFacingServiceSpecification'
    };

    // Add relatedParty if we have customer info
    if (fieldValues.caNo || fieldValues.customerAccountName) {
      service.relatedParty = [
        {
          role: 'Customer',
          '@type': 'RelatedPartyRefOrPartyRoleRef',
          partyOrPartyRole: {
            id: fieldValues.caNo || '',
            name: fieldValues.customerAccountName || '',
            '@type': 'PartyRoleRef',
            '@referredType': 'Customer'
          }
        }
      ];
    }

    service['@type'] = 'Service';
  }

  return order;
}

// Order templates for each type
export const ORDER_TEMPLATES: Record<string, OrderTemplate> = {
  'create_port': {
    type: 'create_port',
    serviceType: 'CFS_ConnectX_Port',
    specId: 'CFSS_ConnectX_Port',
    action: 'add',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'nonMobileNo', mandatory: true, type: 'string', example: '9000111110-05', description: "Customer's non-mobile number" },
      { name: 'customerName', mandatory: true, type: 'string', example: 'Test Customer Co., Ltd.', description: 'Customer name' },
      { name: 'caNo', mandatory: true, type: 'string', example: 'C230065571', description: 'Customer account no.' },
      { name: 'customerAccountName', mandatory: true, type: 'string', example: 'Test Customer Account', description: 'Customer account name' },
      { name: 'cableType', mandatory: true, type: 'string', example: 'Main', description: 'Cable type: Main or Backup' },
      { name: 'nonMobileMain', mandatory: false, type: 'string', example: '', description: 'Non-mobile main (required if cableType = Backup)' },
      { name: 'customerSiteCode', mandatory: true, type: 'string', example: 'CX_123456', description: 'Customer site code' },
      { name: 'dcLocation', mandatory: true, type: 'string', example: 'STTT3', description: 'Data Center Location' },
      { name: 'portType', mandatory: true, type: 'string', example: '1G', description: 'Port type: 1G, 10G, 100G' },
      { name: 'isDiversity', mandatory: false, type: 'boolean', example: false, description: 'Port diversity' },
      { name: 'diversityNonmobile', mandatory: false, type: 'string', example: '', description: 'Diversity nonmobile (required if isDiversity = true)' },
      { name: 'serviceVlanType', mandatory: false, type: 'string', example: 'dot1q', description: 'Service VLAN type: dot1q, access, qinq' },
      { name: 'networkServiceType', mandatory: true, type: 'string', example: 'L2VPN', description: 'Network service type: L2VPN, L3VPN, L3VPN-INTERNET' },
      { name: 'reservedPortId', mandatory: true, type: 'string', example: 'PORT-12345', description: 'Port ID from inventory' },
      { name: 'orderRef', mandatory: true, type: 'string', example: 'AWN-NW-2024-000001', description: 'Order reference from SSS' },
    ]
  },
  'terminate_port': {
    type: 'terminate_port',
    serviceType: 'CFS_ConnectX_Port',
    specId: 'CFSS_ConnectX_Port',
    action: 'modify',
    isTermination: true,
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-PORT-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'state', mandatory: true, type: 'string', example: 'terminated', description: 'Service lifecycle status', topLevel: true },
      { name: 'remark', mandatory: false, type: 'string', example: 'Termination requested by customer', description: 'Termination remark' },
    ]
  },
  'create_lag': {
    type: 'create_lag',
    serviceType: 'CFS_ConnectX_LAG',
    specId: 'CFSS_ConnectX_LAG',
    action: 'add',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'nonMobileNo', mandatory: true, type: 'string', example: '9000111111', description: "Customer's non-mobile number" },
      { name: 'customerName', mandatory: true, type: 'string', example: 'Test Customer LAG Co.', description: 'Customer name' },
      { name: 'caNo', mandatory: true, type: 'string', example: 'C230065571', description: 'Customer account no.' },
      { name: 'customerAccountName', mandatory: true, type: 'string', example: 'Test Customer Account', description: 'Customer account name' },
      { name: 'cableType', mandatory: true, type: 'string', example: 'Main', description: 'Cable type: Main or Backup' },
      { name: 'customerSiteCode', mandatory: true, type: 'string', example: 'CX_123456', description: 'Customer site code' },
      { name: 'bandwidth', mandatory: false, type: 'string', example: '50M', description: 'Bandwidth (e.g., 50M, 1G)' },
      { name: 'dcLocation', mandatory: true, type: 'string', example: 'STTT3', description: 'Data Center Location' },
      { name: 'portType', mandatory: true, type: 'string', example: '10G', description: 'Port type: 1G, 10G, 100G' },
      { name: 'lagNumber', mandatory: false, type: 'string', example: '2', description: 'Number of ports in LAG (1-8)' },
      { name: 'serviceVlanType', mandatory: true, type: 'string', example: 'dot1q', description: 'Service VLAN type: dot1q, access, qinq' },
      { name: 'networkServiceType', mandatory: true, type: 'string', example: 'L2VPN', description: 'Network service type' },
      { name: 'orderRef', mandatory: true, type: 'string', example: 'AWN-NW-2024-000002', description: 'Order reference from SSS' },
    ]
  },
  'terminate_lag': {
    type: 'terminate_lag',
    serviceType: 'CFS_ConnectX_LAG',
    specId: 'CFSS_ConnectX_LAG',
    action: 'modify',
    isTermination: true,
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-LAG-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'state', mandatory: true, type: 'string', example: 'terminated', description: 'Service lifecycle status', topLevel: true },
      { name: 'remark', mandatory: false, type: 'string', example: 'LAG termination requested', description: 'Termination remark' },
    ]
  },
  'upgrade_lag': {
    type: 'upgrade_lag',
    serviceType: 'CFS_ConnectX_LAG',
    specId: 'CFSS_ConnectX_LAG',
    action: 'modify',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-LAG-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'portType', mandatory: true, type: 'string', example: '10G', description: 'Port type: 1G, 10G, 100G' },
      { name: 'lagNumber', mandatory: false, type: 'string', example: '2', description: 'Number of ports in LAG (1-8)' },
    ]
  },
  'downgrade_lag': {
    type: 'downgrade_lag',
    serviceType: 'CFS_ConnectX_LAG',
    specId: 'CFSS_ConnectX_LAG',
    action: 'modify',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-LAG-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'releasePort', mandatory: true, type: 'StringArray', example: '["GigabitEthernet0/0/10", "GigabitEthernet0/0/11"]', description: 'Ports to be released/returned' },
    ]
  },
  'create_vxc': {
    type: 'create_vxc',
    serviceType: 'CFS_ConnectX_VXC',
    specId: 'CFSS_ConnectX_VXC',
    action: 'add',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'nonMobileNo', mandatory: true, type: 'string', example: '9000111112', description: "Customer's non-mobile number" },
      { name: 'customerName', mandatory: true, type: 'string', example: 'Test VXC Customer', description: 'Customer name' },
      { name: 'caNo', mandatory: true, type: 'string', example: 'C230065572', description: 'Customer account no.' },
      { name: 'customerAccountName', mandatory: true, type: 'string', example: 'Test VXC Account', description: 'Customer account name' },
      { name: 'bandwidth', mandatory: true, type: 'string', example: '100M', description: 'VXC bandwidth' },
      { name: 'vlanId', mandatory: true, type: 'string', example: '100', description: 'VLAN ID for VXC' },
      { name: 'networkServiceType', mandatory: true, type: 'string', example: 'L2VPN', description: 'Network service type' },
      { name: 'orderRef', mandatory: true, type: 'string', example: 'AWN-NW-2024-000003', description: 'Order reference from SSS' },
    ]
  },
  'terminate_vxc': {
    type: 'terminate_vxc',
    serviceType: 'CFS_ConnectX_VXC',
    specId: 'CFSS_ConnectX_VXC',
    action: 'modify',
    isTermination: true,
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-VXC-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'state', mandatory: true, type: 'string', example: 'terminated', description: 'Service lifecycle status', topLevel: true },
      { name: 'remark', mandatory: false, type: 'string', example: 'VXC termination requested', description: 'Termination remark' },
    ]
  },
  'autoburst_vxc': {
    type: 'autoburst_vxc',
    serviceType: 'CFS_ConnectX_VXC',
    specId: 'CFSS_ConnectX_VXC',
    action: 'modify',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-VXC-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'burstOrderType', mandatory: true, type: 'string', example: 'UP', description: 'Order Type: UP (Up Speed) or DP (Down Speed)' },
      { name: 'bustLinkSpeed', mandatory: true, type: 'string', example: '1024 Mbps', description: 'Expected speed [Mbps, Kbps, Gbps]' },
      { name: 'gcpLinkType', mandatory: false, type: 'string', example: 'LINK_TYPE_ETHERNET_10G_LR', description: 'GCP Link Type setting' },
      { name: 'burstEffectiveDate', mandatory: true, type: 'string', example: '12-09-2025', description: 'Effective date (DD-MM-YYYY)' },
      { name: 'burstEndDate', mandatory: false, type: 'string', example: '31-12-2999', description: 'End date (DD-MM-YYYY)' },
    ]
  },
  'create_vxc_cloud': {
    type: 'create_vxc_cloud',
    serviceType: 'CFS_ConnectX_VXC_Cloud',
    specId: 'CFSS_ConnectX_VXC_Cloud',
    action: 'add',
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'nonMobileNo', mandatory: true, type: 'string', example: '9000111113', description: "Customer's non-mobile number" },
      { name: 'customerName', mandatory: true, type: 'string', example: 'Test Cloud Customer', description: 'Customer name' },
      { name: 'caNo', mandatory: true, type: 'string', example: 'C230065573', description: 'Customer account no.' },
      { name: 'customerAccountName', mandatory: true, type: 'string', example: 'Test Cloud Account', description: 'Customer account name' },
      { name: 'bandwidth', mandatory: true, type: 'string', example: '200M', description: 'Cloud VXC bandwidth' },
      { name: 'cloudProvider', mandatory: true, type: 'string', example: 'AWS', description: 'Cloud provider (AWS, Azure, GCP)' },
      { name: 'vlanId', mandatory: true, type: 'string', example: '200', description: 'VLAN ID for cloud VXC' },
      { name: 'orderRef', mandatory: true, type: 'string', example: 'AWN-NW-2024-000004', description: 'Order reference from SSS' },
    ]
  },
  'terminate_vxc_cloud': {
    type: 'terminate_vxc_cloud',
    serviceType: 'CFS_ConnectX_VXC_Cloud',
    specId: 'CFSS_ConnectX_VXC_Cloud',
    action: 'modify',
    isTermination: true,
    fields: [
      { name: 'externalId', mandatory: true, type: 'string', example: generateUUID(), description: 'Top order level id', topLevel: true },
      { name: 'inventoryId', mandatory: true, type: 'string', example: 'INV-VXCCLOUD-12345', description: 'Inventory ID of the service', topLevel: true },
      { name: 'state', mandatory: true, type: 'string', example: 'terminated', description: 'Service lifecycle status', topLevel: true },
      { name: 'remark', mandatory: false, type: 'string', example: 'Cloud VXC termination requested', description: 'Termination remark' },
    ]
  }
};
