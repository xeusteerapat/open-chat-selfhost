import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import chatSlice from './slices/chatSlice';
import { api } from './api/index';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    api: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;