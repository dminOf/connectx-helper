# ConnectX Helper

Reusable components for ConnectX integration, including configuration management, logging, MongoDB, and Kafka connectivity.

Built with **Bun** (server + frontend) and **React 19** with **shadcn/ui** components.

## Quick Start

```bash
# Install dependencies
bun install

# Run the application
bun dev

# Run all tests
bun test
```

## Components

### 1. Config Loader
Load and parse TOML configuration files with automatic merging.

```typescript
import { loadConfig, getConfig } from './src/components/config-loader';

await loadConfig('./config/config.toml');
const config = getConfig();
```

### 2. Logger
Centralized logging with file rotation and console output.

```typescript
import { initLogger, logger } from './src/components/logger';

initLogger(config.Logger);
logger.info('Application started');
logger.error('Error occurred', error);
```

### 3. MongoDB
MongoDB connection manager with replica set support.

```typescript
import { connectMongoDB, getDB } from './src/components/mongodb';

await connectMongoDB(config.mongodb);
const db = getDB();
const collection = db.collection('myCollection');
```

### 4. Kafka
Kafka producer/consumer with TLS/SASL support.

```typescript
import { initKafka, sendMessage, onMessage } from './src/components/kafka';

await initKafka(config.Kafka);
await sendMessage('topic-name', { message: 'Hello' });

onMessage('topic-name', (message) => {
  console.log('Received:', message);
});
```

## Testing

Individual component tests:

```bash
bun test:config   # Test config loader
bun test:mongodb  # Test MongoDB connection
bun test:kafka    # Test Kafka connection
```

## Project Structure

```
connectx-helper/
├── src/
│   ├── components/       # Reusable components
│   │   ├── config-loader.ts
│   │   ├── logger.ts
│   │   ├── mongodb.ts
│   │   ├── kafka.ts
│   │   └── index.ts
│   ├── App.tsx          # React application
│   └── index.tsx        # Entry point
├── tests/               # Component tests
├── config/              # Configuration files
│   ├── config.toml
│   └── test_tmf_common_config.toml
└── logs/               # Application logs
```

## Configuration

Configuration is managed via TOML files in the `config/` directory:

- `config.toml` - Main configuration file
- `test_tmf_common_config.toml` - Common TMF configuration

See `CLAUDE.md` for detailed configuration options.

## Documentation

For complete documentation, usage examples, and development guidelines, see [CLAUDE.md](./CLAUDE.md).

## Requirements

- **Bun runtime** (v1.2.18+)
- **MongoDB instance** (replica set recommended)
- **Kafka broker** (with SCRAM-SHA-256 support)

## Technology Stack

- **Runtime:** Bun (server + frontend)
- **Frontend:** React 19 + shadcn/ui + Tailwind CSS
- **Backend:** Custom components (Config, Logger, MongoDB, Kafka)
- **Type Safety:** TypeScript throughout

## License

Internal use - Corp AIS
