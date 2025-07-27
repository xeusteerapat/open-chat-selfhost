import fp from "fastify-plugin";
import env from "@fastify/env";
import type { FastifyInstance } from "fastify";

const schema = {
  type: "object",
  required: ["JWT_SECRET", "ENCRYPTION_KEY"],
  properties: {
    PORT: {
      type: "string",
      default: "3000",
    },
    HOST: {
      type: "string",
      default: "0.0.0.0",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    DATABASE_URL: {
      type: "string",
    },
    JWT_SECRET: {
      type: "string",
    },
    ENCRYPTION_KEY: {
      type: "string",
    },
    ALLOWED_ORIGINS: {
      type: "string",
      default: "http://localhost:5173",
    },
    REDIS_URL: {
      type: "string",
    },
    OLLAMA_BASE_URL: {
      type: "string",
    },
  },
};

const options = {
  confKey: "config",
  schema,
  data: process.env,
  dotenv: false,
};

export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(env, options);
});

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: string;
      HOST: string;
      NODE_ENV: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      ENCRYPTION_KEY: string;
      ALLOWED_ORIGINS: string;
      REDIS_URL?: string;
      OLLAMA_BASE_URL?: string;
    };
  }
}
