import { serve } from "bun";
import index from "./index.html";
import { loadConfig, getConfig } from "./components/config-loader";
import { initLogger, logger } from "./components/logger";
import { connectMongoDB, getDB } from "./components/mongodb";
import { resolve } from "path";

// Initialize application
async function initializeApp() {
  try {
    // Load configuration
    const configPath = resolve(import.meta.dir, '../config/config.toml');
    await loadConfig(configPath);
    const config = getConfig();

    // Initialize logger
    initLogger(config.Logger);
    logger.info('Application initializing...');

    // Connect to MongoDB
    await connectMongoDB(config.mongodb);
    logger.info('MongoDB connected');

    logger.info('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Initialize before starting server
await initializeApp();

const server = serve({
  routes: {
    // API: Get service specification by ID
    "/api/specifications/:id": async (req) => {
      try {
        const specId = req.params.id;
        logger.info(`Fetching specification: ${specId}`);

        const db = getDB();
        const collection = db.collection('serviceSpecification');

        const specification = await collection.findOne({ id: specId });

        if (!specification) {
          return Response.json(
            { error: 'Specification not found' },
            { status: 404 }
          );
        }

        return Response.json(specification);
      } catch (error) {
        logger.error('Error fetching specification', error);
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    },

    // API: Update characteristic in specification
    "/api/specifications/:id/characteristic": {
      async PATCH(req) {
        try {
          const specId = req.params.id;
          const body = await req.json();
          const { oldName, newName, minCardinality } = body;

          if (!oldName) {
            return Response.json(
              { error: 'oldName is required' },
              { status: 400 }
            );
          }

          logger.info(`Updating characteristic: ${oldName} in ${specId}`);

          const db = getDB();
          const collection = db.collection('serviceSpecification');

          // Build update operations
          const updateOps: any = {};

          if (newName && newName !== oldName) {
            updateOps['specCharacteristic.$[elem].name'] = newName;
          }

          if (minCardinality !== undefined) {
            updateOps['specCharacteristic.$[elem].minCardinality'] = minCardinality;
          }

          const result = await collection.updateOne(
            { id: specId },
            { $set: updateOps },
            { arrayFilters: [{ 'elem.name': oldName }] }
          );

          if (result.matchedCount === 0) {
            return Response.json(
              { error: 'Specification not found' },
              { status: 404 }
            );
          }

          return Response.json({ success: true, modified: result.modifiedCount });
        } catch (error) {
          logger.error('Error updating characteristic', error);
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        }
      },

      async POST(req) {
        try {
          const specId = req.params.id;
          const body = await req.json();
          const { name, valueType, minCardinality } = body;

          if (!name || !valueType) {
            return Response.json(
              { error: 'name and valueType are required' },
              { status: 400 }
            );
          }

          logger.info(`Adding new characteristic: ${name} to ${specId}`);

          const db = getDB();
          const collection = db.collection('serviceSpecification');

          // Create new characteristic with default values
          const newCharacteristic = {
            name,
            valueType,
            configurable: true,
            minCardinality: minCardinality !== undefined ? minCardinality : 0,
            maxCardinality: 1
          };

          const result = await collection.updateOne(
            { id: specId },
            { $push: { specCharacteristic: newCharacteristic } }
          );

          if (result.matchedCount === 0) {
            return Response.json(
              { error: 'Specification not found' },
              { status: 404 }
            );
          }

          return Response.json({ success: true, characteristic: newCharacteristic });
        } catch (error) {
          logger.error('Error adding characteristic', error);
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        }
      },

      async DELETE(req) {
        try {
          const specId = req.params.id;
          const body = await req.json();
          const { name } = body;

          if (!name) {
            return Response.json(
              { error: 'name is required' },
              { status: 400 }
            );
          }

          logger.info(`Deleting characteristic: ${name} from ${specId}`);

          const db = getDB();
          const collection = db.collection('serviceSpecification');

          const result = await collection.updateOne(
            { id: specId },
            { $pull: { specCharacteristic: { name } } }
          );

          if (result.matchedCount === 0) {
            return Response.json(
              { error: 'Specification not found' },
              { status: 404 }
            );
          }

          return Response.json({ success: true, modified: result.modifiedCount });
        } catch (error) {
          logger.error('Error deleting characteristic', error);
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        }
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
