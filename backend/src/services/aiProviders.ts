import type { Message } from '../types/index.js';

export interface AIProvider {
  id: string;
  name: string;
  generateResponse(
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string>;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface AnthropicResponse {
  content: {
    text: string;
  }[];
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface OllamaResponse {
  message: {
    content: string;
  };
  done: boolean;
}

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';

  async generateResponse(
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string> {
    const openaiMessages: OpenAIMessage[] = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    return data.choices[0]?.message?.content || 'No response generated';
  }
}

export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic';

  async generateResponse(
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string> {
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as AnthropicResponse;
    return data.content[0]?.text || 'No response generated';
  }
}

export class OpenRouterProvider implements AIProvider {
  id = 'openrouter';
  name = 'OpenRouter';

  async generateResponse(
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string> {
    const openrouterMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: openrouterMessages,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    return data.choices[0]?.message?.content || 'No response generated';
  }
}

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama';

  async generateResponse(
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string> {
    // For Ollama, apiKey is actually the base URL (e.g., "http://localhost:11434")
    // If no apiKey provided, use the environment variable or default
    const baseUrl =
      apiKey || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Add timeout handling for slow Ollama responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Answer directly and concisely. Do not show your reasoning process.',
          },
          ...ollamaMessages,
        ],
        think: false,
        stream: false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OllamaResponse;
    return data.message?.content || 'No response generated';
  }
}

export class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new OpenRouterProvider());
    this.registerProvider(new OllamaProvider());
  }

  registerProvider(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  async generateResponse(
    providerId: string,
    messages: Message[],
    model: string,
    apiKey: string
  ): Promise<string> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return provider.generateResponse(messages, model, apiKey);
  }
}

export const aiProviderManager = new AIProviderManager();
