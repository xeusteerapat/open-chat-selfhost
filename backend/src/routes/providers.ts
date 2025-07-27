import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Provider } from "../types/index.js";

const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", maxTokens: 4096 },
      { id: "gpt-4", name: "GPT-4", maxTokens: 8192 },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", maxTokens: 128000 },
      { id: "gpt-4o", name: "GPT-4o", maxTokens: 128000 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        maxTokens: 200000,
      },
      {
        id: "claude-3-sonnet-20240229",
        name: "Claude 3 Sonnet",
        maxTokens: 200000,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        maxTokens: 200000,
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      {
        id: "openai/gpt-3.5-turbo",
        name: "GPT-3.5 Turbo (OpenRouter)",
        maxTokens: 4096,
      },
      { id: "openai/gpt-4", name: "GPT-4 (OpenRouter)", maxTokens: 8192 },
      {
        id: "anthropic/claude-3-sonnet",
        name: "Claude 3 Sonnet (OpenRouter)",
        maxTokens: 200000,
      },
      {
        id: "meta-llama/llama-2-70b-chat",
        name: "Llama 2 70B Chat",
        maxTokens: 4096,
      },
      {
        id: "qwen/qwen3-coder",
        name: "Qwen3 Coder",
        maxTokens: 4096,
      },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    models: [
      { id: "qwen3:8b", name: "Qwen3", maxTokens: 128000 },
      { id: "codellama", name: "Code Llama", maxTokens: 4096 },
      { id: "gemma2", name: "Gemma 2", maxTokens: 8192 },
      { id: "qwen2.5", name: "Qwen 2.5", maxTokens: 32768 },
      { id: "deepseek-coder", name: "DeepSeek Coder", maxTokens: 16384 },
    ],
  },
];

export default async function providerRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get(
    "/providers",
    {
      schema: {
        tags: ["Providers"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      reply.send(providers);
    }
  );

  fastify.get(
    "/providers/:provider/models",
    {
      schema: {
        tags: ["Providers"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            provider: { type: "string" },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { provider: string } }>,
      reply
    ) => {
      const providerId = request.params.provider;

      const provider = providers.find((p) => p.id === providerId);

      if (!provider) {
        return reply.code(404).send({ error: "Provider not found" });
      }

      reply.send(provider.models);
    }
  );
}
