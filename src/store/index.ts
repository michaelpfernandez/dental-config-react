import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { benefitClassApi } from './apis/benefitClassApi';
import benefitClassReducer from './slices/benefitClassSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    benefitClass: benefitClassReducer,
    [benefitClassApi.reducerPath]: benefitClassApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(benefitClassApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
