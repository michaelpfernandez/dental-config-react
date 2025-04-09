import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { benefitClassApi } from './apis/benefitClassApi';
import { benefitApi } from './apis/benefitApi';
import { limitApi } from './apis/limitApi';
import benefitClassReducer from './slices/benefitClassSlice';
import limitReducer from './slices/limitSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    benefitClass: benefitClassReducer,
    limits: limitReducer,
    [benefitClassApi.reducerPath]: benefitClassApi.reducer,
    [benefitApi.reducerPath]: benefitApi.reducer,
    [limitApi.reducerPath]: limitApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      benefitClassApi.middleware,
      benefitApi.middleware,
      limitApi.middleware
    ),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
