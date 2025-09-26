import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import tripReducer from './slices/tripSlice';

/**
 * 配置Redux store
 * 包含地图状态和行程状态管理
 */
export const store = configureStore({
  reducer: {
    map: mapReducer,
    trip: tripReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;