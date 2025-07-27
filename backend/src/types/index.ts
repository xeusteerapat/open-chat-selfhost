export interface User {
	id: number;
	username: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ApiKey {
	id: number;
	userId: number;
	provider: string;
	keyName: string;
	encryptedKey: string;
	isActive: boolean;
	createdAt: Date;
}

export interface Conversation {
	id: number;
	userId: number;
	title: string;
	provider: string;
	model: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Message {
	id: number;
	conversationId: number;
	role: 'user' | 'assistant' | 'system';
	content: string;
	metadata?: any;
	createdAt: Date;
}

export interface AuthTokenPayload {
	userId: number;
	username: string;
}

export interface ChatRequest {
	conversationId?: number;
	message: string;
	provider: string;
	model: string;
	stream?: boolean;
}

export interface ChatResponse {
	id: string;
	content: string;
	role: 'assistant';
	conversationId: number;
	messageId: number;
}

export interface Provider {
	id: string;
	name: string;
	models: Model[];
}

export interface Model {
	id: string;
	name: string;
	description?: string;
	maxTokens?: number;
}
