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

		const data = await response.json();
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

		const data = await response.json();
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
					max_tokens: 1000,
					temperature: 0.7,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(
				`OpenRouter API error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();
		return data.choices[0]?.message?.content || 'No response generated';
	}
}

export class AIProviderManager {
	private providers: Map<string, AIProvider> = new Map();

	constructor() {
		this.registerProvider(new OpenAIProvider());
		this.registerProvider(new AnthropicProvider());
		this.registerProvider(new OpenRouterProvider());
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
