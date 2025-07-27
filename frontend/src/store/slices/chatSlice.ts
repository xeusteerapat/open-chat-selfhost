import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message, ChatState } from '@/types';

const initialState: ChatState = {
	currentConversation: null,
	messages: [],
	isLoading: false,
	error: null,
};

const chatSlice = createSlice({
	name: 'chat',
	initialState,
	reducers: {
		setCurrentConversation: (
			state,
			action: PayloadAction<Conversation | null>
		) => {
			state.currentConversation = action.payload;
		},
		setMessages: (state, action: PayloadAction<Message[]>) => {
			state.messages = action.payload;
		},
		addMessage: (state, action: PayloadAction<Message>) => {
			state.messages.push(action.payload);
		},
		updateMessage: (
			state,
			action: PayloadAction<{ id: number; content: string }>
		) => {
			const message = state.messages.find((m) => m.id === action.payload.id);
			if (message) {
				message.content = action.payload.content;
			}
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const {
	setCurrentConversation,
	setMessages,
	addMessage,
	updateMessage,
	setLoading,
	setError,
} = chatSlice.actions;
export default chatSlice.reducer;
