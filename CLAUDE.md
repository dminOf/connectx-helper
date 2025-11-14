# ConnectX Helper

## Project Overview

This is a Bun + React application that provides helper utilities for ConnectX integration. The project includes reusable components for configuration management, logging, MongoDB, and Kafka connectivity that can be used in other projects.

**Technology Stack:**
- **Runtime:** Bun (used for both server and frontend)
- **Frontend Framework:** React 19
- **UI Components:** shadcn/ui
- **Backend Components:** Custom reusable modules (Config, Logger, MongoDB, Kafka)

## Project Structure

```
connectx-helper/
├── config/               # Configuration files
│   ├── config.toml      # Main configuration file
│   ├── test_tmf_common_config.toml  # Common TMF configuration
│   └── certs/           # Kafka TLS certificates
│       ├── ca-cert
│       ├── client-cert.pem
│       └── client-key.pem
├── src/                 # Source code
│   ├── components/      # Reusable components (to be created)
│   ├── tests/          # Test files (to be created)
│   └── ...
├── logs/               # Application logs
└── notes/              # Planning and analysis documents
```

## Core Components (Reusable)

### 1. Config File Loader
**Location:** `src/components/config-loader.ts`

**Purpose:** Load and parse TOML configuration files

**Features:**
- Loads `config.toml` at application start
- Automatically loads referenced config file (`test_tmf_common_config.toml`)
- Makes config available globally throughout the application
- Type-safe configuration interface

**Usage:**
```typescript
import { loadConfig, getConfig } from './components/config-loader';

// At app startup
await loadConfig('./config/config.toml');

// Anywhere in the app
const config = getConfig();
```

### 2. Logger
**Location:** `src/components/logger.ts`

**Purpose:** Centralized logging with file and console output

**Features:**
- Configured from TOML config file
- Supports log rotation (MaxSizeMB, MaxBackups, MaxAgeDays)
- Console and file output
- Log compression
- Pattern masking for sensitive data
- Different log levels (info, warn, error, debug)

**Configuration:**
```toml
[Logger]
    LogDir = './logs/'
    LogFileName = "connx_helper_"
    MaxSizeMB = 10
    MaxBackups = 10
    MaxAgeDays = 10
    Compress = true
    ToConsole = true
    MaskingRegexPatterns = []
```

**Usage:**
```typescript
import { initLogger, logger } from './components/logger';

// Initialize (called once at startup after config is loaded)
initLogger(config.Logger);

// Use anywhere
logger.info('Application started');
logger.error('Error occurred', error);
```

### 3. MongoDB Connection
**Location:** `src/components/mongodb.ts`

**Purpose:** Manage MongoDB connection and operations

**Features:**
- Connection pooling
- Replica set support
- Authentication
- Automatic reconnection
- Type-safe database operations

**Configuration:**
```toml
[mongodb]
    hosts = ["10.138.33.193:25000", "10.138.33.206:25000", "10.138.33.198:25000"]
    database = "service"
    username = "tmfService"
    password = "tmfServicePassword"
    replicaSet = "replSetdev"
```

**Usage:**
```typescript
import { connectMongoDB, getDB } from './components/mongodb';

// At startup
await connectMongoDB(config.mongodb);

// Use anywhere
const db = getDB();
const collection = db.collection('myCollection');
```

### 4. Kafka Connection
**Location:** `src/components/kafka.ts`

**Purpose:** Kafka producer and consumer management

**Features:**
- TLS/SSL support
- SASL authentication
- Producer and consumer support
- Topic auto-creation
- Consumer groups
- Dynamic consumer naming

**Configuration:**
```toml
[Kafka]
    EnableKafka = true
    Brokers = ["DMYAISKAFKA-0001:9093", "DMYAISKAFKA-0002:9093", "DMYAISKAFKA-0003:9093"]
    ListenTopicsList = []
    EnableTLS = true
    EnableSASL = true
    CACert = './config/certs/ca-cert'
    ClientSignedCert = './config/certs/client-cert.pem'
    ClientPrivateKey = './config/certs/client-key.pem'
    SASLUser = 'admin'
    SASLPassword = "Aisadmin_secret"
    AutomaticallyCreateTopics = true
    DefaultNumberOfPartitions = 5
    ConsumerGroup = 'connectx-helper'
    EnableDynamicConsumerName = true
```

**Usage:**
```typescript
import { initKafka, getProducer, getConsumer } from './components/kafka';

// At startup
await initKafka(config.Kafka);

// Produce messages
const producer = getProducer();
await producer.send('topic-name', { key: 'value' });

// Consume messages
const consumer = getConsumer();
await consumer.subscribe(['topic-name'], (message) => {
  console.log('Received:', message);
});
```

## Frontend

### React + shadcn/ui

The frontend uses React 19 with shadcn/ui for UI components.

**Setup:**
- **Runtime:** Bun (for both development server and production)
- **UI Library:** shadcn/ui - A collection of re-usable components built with Radix UI and Tailwind CSS
- **Styling:** Tailwind CSS (configured via shadcn/ui)
- **Type Safety:** Full TypeScript support

**Development Server:**
```bash
bun dev          # Start development server with hot reload
```

**Adding shadcn/ui Components:**
```bash
# Install shadcn/ui CLI (if not already done)
bunx shadcn-ui@latest init

# Add components as needed
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add card
bunx shadcn-ui@latest add dialog
```

**Using Components:**
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

**Note:** shadcn/ui components are copied into your project (`src/components/ui/`), giving you full control to customize them.

## Testing

### Test Files
**Location:** `tests/`

All components have corresponding test files to validate functionality:

1. **Config Loader Test** (`tests/config-loader.test.ts`)
   - Load and parse both config files
   - Validate field parsing
   - Check nested config references

2. **MongoDB Test** (`tests/mongodb.test.ts`)
   - Connect to MongoDB
   - Create `test` collection
   - Write a test record
   - Query and validate the record
   - Cleanup test data

3. **Kafka Test** (`tests/kafka.test.ts`)
   - Connect to Kafka
   - Create producer
   - Send message to `test` topic
   - Create consumer
   - Read and validate message from `test` topic

### Running Tests
```bash
bun test
```

## Application Initialization Flow

### Backend (Server) Initialization
```
1. Load config.toml
   ↓
2. Initialize logger (using config)
   ↓
3. Connect to MongoDB (using config)
   ↓
4. Connect to Kafka (using config)
   ↓
5. Start Bun server (HTTP + WebSocket support)
```

### Frontend Initialization
```
1. Bun dev server starts
   ↓
2. React app mounts
   ↓
3. shadcn/ui components render
   ↓
4. Hot module replacement enabled (HMR)
```

## Development Tasks

### Phase 1: Core Components ✅ COMPLETED
- ✅ Implement config file loader
- ✅ Implement logger component
- ✅ Implement MongoDB connection
- ✅ Implement Kafka connection (with SCRAM-SHA-256)
- ✅ Create tests for all components (29/29 tests passing)
- ✅ Cleanup dummy React code
- ✅ Documentation (CLAUDE.md + README.md)

### Phase 2: Frontend Implementation ✅ COMPLETED
- ✅ Integrated backend components with Bun server
- ✅ Created main layout with 4 tabs (Specs, Inventory, Service Activation, Example Requests)
- ✅ Implemented Specs page with 4 sub-tabs (Port, LAG, VXC, VXC Cloud)
- ✅ Added specifications table with MongoDB integration
- ✅ Implemented table features:
  - Sortable columns (name, valueType, mandatory)
  - Search filter across all fields
  - Refresh button with loading state
  - Mandatory field indicator (yellow bar)
  - Result counter
- ✅ Added Quick Links collapsible sidebar
- ✅ Implemented Excel download feature
  - Downloads all 4 specifications as separate sheets
  - Columns: Field Name, Value Type, Mandatory
  - Timestamped filename
  - Green button in sub-tabs header
- ✅ Responsive design for mobile devices
- ✅ API endpoint: GET /api/specifications/:id

### Phase 3: Additional Features (Next Steps)
- [ ] Implement Inventory tab
- [ ] Implement Service Activation tab
- [ ] Implement Example Requests tab
- [ ] Add graceful shutdown handlers
- [ ] Add health check endpoints
- [ ] Add more shadcn/ui components as needed

## Notes and Analysis

Use the `notes/` folder for planning, tracking, and analysis documents:
- Planning documents
- Architecture decisions
- API analysis
- Implementation notes

## Development Guidelines

1. **Reusability:** All components should be designed for reuse in other projects
2. **Type Safety:** Use TypeScript interfaces and types
3. **Error Handling:** Proper error handling and logging
4. **Testing:** All components must have tests
5. **Documentation:** Clear documentation and usage examples
6. **Configuration:** All settings via TOML config files

## Dependencies

### Runtime & Framework
- **Runtime:** Bun (server + frontend)
- **Frontend Framework:** React 19
- **UI Components:** shadcn/ui (component library)
- **TypeScript:** Full type safety across the project

### Backend Components
- **Config Parser:** @iarna/toml (TOML configuration files)
- **Logger:** Custom implementation with rotation and masking
- **MongoDB Driver:** mongodb@6.20.0
- **Kafka Client:** kafkajs@2.2.4 (with TLS + SCRAM-SHA-256)
- **Excel Export:** xlsx@0.18.5 (SheetJS for Excel file generation)

### Development
- **Package Manager:** Bun
- **Testing:** Custom test suite with Bun test runner
- **Build:** Bun bundler

## Environment

- **Platform:** Windows (development)
- **Runtime:** Bun
- **Node Version:** Compatible with Bun
- **Go Version:** Available on system for other projects
