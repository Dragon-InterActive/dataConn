
// src/core/dataConn.ts
import { loadEnv } from "./envLoader.ts";

// Load environment variables
loadEnv();

// Database adapter imports
import { PostgresAdapter } from "../adapters/postgres/postgresAdapter.ts";
import { MySQLAdapter } from "../adapters/mysql/mysqlAdapter.ts";
import { RedisAdapter } from "../adapters/redis/redisAdapter.ts";
import { MongoAdapter } from "../adapters/mongo/mongoAdapter.ts";

// Main object providing database instances
export const dataConn = {
  pg: () => new PostgresAdapter(),
  mysql: () => new MySQLAdapter(),
  redis: () => new RedisAdapter(),
  mongo: () => new MongoAdapter()
};
