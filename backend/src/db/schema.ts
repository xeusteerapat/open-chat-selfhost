import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 50 }).notNull().unique(),
	email: varchar('email', { length: 100 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	provider: varchar('provider', { length: 50 }).notNull(),
	keyName: varchar('key_name', { length: 100 }).notNull(),
	encryptedKey: text('encrypted_key').notNull(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const conversations = pgTable('conversations', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	title: varchar('title', { length: 255 }).notNull(),
	provider: varchar('provider', { length: 50 }).notNull(),
	model: varchar('model', { length: 100 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
	id: serial('id').primaryKey(),
	conversationId: integer('conversation_id')
		.notNull()
		.references(() => conversations.id),
	role: varchar('role', { length: 20 }).notNull(),
	content: text('content').notNull(),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	apiKeys: many(apiKeys),
	conversations: many(conversations),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
	user: one(users, {
		fields: [apiKeys.userId],
		references: [users.id],
	}),
}));

export const conversationsRelations = relations(
	conversations,
	({ one, many }) => ({
		user: one(users, {
			fields: [conversations.userId],
			references: [users.id],
		}),
		messages: many(messages),
	})
);

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
}));
