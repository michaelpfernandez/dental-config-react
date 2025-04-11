import { configureStore } from '@reduxjs/toolkit';
import { setupListeners, Api } from '@reduxjs/toolkit/query';

export function setupApiStore(api: Api<any, any, any, any>) {
  const getStore = () =>
    configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
      },
      middleware: (gdm) =>
        gdm({ serializableCheck: false, immutableCheck: false }).concat(api.middleware),
    });

  const store = getStore();
  setupListeners(store.dispatch);

  return {
    store,
    api,
  };
}
