import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POI, Coordinates, TripPlan } from '../../types';

interface MapState {
  center: Coordinates;
  zoom: number;
  selectedPOIs: POI[];
  customPOIs: POI[];
  currentTrip?: TripPlan;
  isLoading: boolean;
  error: string | null;
}

const initialState: MapState = {
  center: { lat: 39.9042, lng: 116.4074 }, // 北京天安门
  zoom: 13,
  selectedPOIs: [],
  customPOIs: [],
  currentTrip: undefined,
  isLoading: false,
  error: null,
};

/**
 * 地图状态管理slice
 * 管理地图中心点、缩放级别、选中的POI等状态
 */
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // 设置地图中心点和缩放级别
    setMapView: (state, action: PayloadAction<{ center: Coordinates; zoom: number }>) => {
      state.center = action.payload.center;
      state.zoom = action.payload.zoom;
    },

    // 添加POI到选择列表
    addSelectedPOI: (state, action: PayloadAction<POI>) => {
      const exists = state.selectedPOIs.find(poi => poi.id === action.payload.id);
      if (!exists) {
        state.selectedPOIs.push(action.payload);
      }
    },

    // 从选择列表移除POI
    removeSelectedPOI: (state, action: PayloadAction<string>) => {
      state.selectedPOIs = state.selectedPOIs.filter(poi => poi.id !== action.payload);
    },

    // 更新POI的游玩时长
    updatePOIDuration: (state, action: PayloadAction<{ id: string; duration: number }>) => {
      const poi = state.selectedPOIs.find(p => p.id === action.payload.id);
      if (poi) {
        poi.customDuration = action.payload.duration;
      }
    },

    // 添加自定义POI
    addCustomPOI: (state, action: PayloadAction<POI>) => {
      state.customPOIs.push(action.payload);
      state.selectedPOIs.push(action.payload);
    },

    // 移除自定义POI
    removeCustomPOI: (state, action: PayloadAction<string>) => {
      state.customPOIs = state.customPOIs.filter(poi => poi.id !== action.payload);
      state.selectedPOIs = state.selectedPOIs.filter(poi => poi.id !== action.payload);
    },

    // 设置当前行程
    setCurrentTrip: (state, action: PayloadAction<TripPlan>) => {
      state.currentTrip = action.payload;
    },

    // 清空当前行程
    clearCurrentTrip: (state) => {
      state.currentTrip = undefined;
    },

    // 清空所有选中的POI
    clearSelectedPOIs: (state) => {
      state.selectedPOIs = [];
      state.customPOIs = [];
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMapView,
  addSelectedPOI,
  removeSelectedPOI,
  updatePOIDuration,
  addCustomPOI,
  removeCustomPOI,
  setCurrentTrip,
  clearCurrentTrip,
  clearSelectedPOIs,
  setLoading,
  setError,
} = mapSlice.actions;

export default mapSlice.reducer;