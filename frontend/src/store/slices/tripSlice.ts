import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TripPlan, TransportMode, PlanningProgress, POI } from '../../types';
import { tripsAPI } from '../../services/api';

interface TripState {
  trips: TripPlan[];
  currentTrip: TripPlan | null;
  isPlanning: boolean;
  planningProgress: PlanningProgress;
  loading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  isPlanning: false,
  planningProgress: { progress: 0, message: '' },
  loading: false,
  error: null,
};

// 异步thunk - 获取用户行程列表
export const fetchTrips = createAsyncThunk(
  'trip/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripsAPI.getTrips();
      return response.data.trips;
    } catch (error: any) {
      const message = error.response?.data?.error || '获取行程列表失败';
      return rejectWithValue(message);
    }
  }
);

// 异步thunk - 创建新行程
export const createTrip = createAsyncThunk(
  'trip/createTrip',
  async (tripData: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await tripsAPI.createTrip(tripData);
      return response.data.trip;
    } catch (error: any) {
      const message = error.response?.data?.error || '创建行程失败';
      return rejectWithValue(message);
    }
  }
);

// 异步thunk - 规划行程路线
export const planTripRoute = createAsyncThunk(
  'trip/planTripRoute',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await tripsAPI.planTrip(tripId);
      return response.data.trip;
    } catch (error: any) {
      const message = error.response?.data?.error || '路线规划失败';
      return rejectWithValue(message);
    }
  }
);

// 异步thunk - 删除行程
export const deleteTripAsync = createAsyncThunk(
  'trip/deleteTripAsync',
  async (tripId: string, { rejectWithValue }) => {
    try {
      await tripsAPI.deleteTrip(tripId);
      return tripId;
    } catch (error: any) {
      const message = error.response?.data?.error || '删除行程失败';
      return rejectWithValue(message);
    }
  }
);

/**
 * 行程状态管理slice
 * 管理用户的行程列表、当前行程规划状态等
 */
const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    // 开始规划行程
    startPlanning: (state) => {
      state.isPlanning = true;
      state.planningProgress = { progress: 0, message: '开始规划...' };
      state.error = null;
    },

    // 更新规划进度
    updatePlanningProgress: (state, action: PayloadAction<PlanningProgress>) => {
      state.planningProgress = action.payload;
    },

    // 规划成功
    planningSuccess: (state, action: PayloadAction<TripPlan>) => {
      state.isPlanning = false;
      state.planningProgress = { progress: 100, message: '规划完成' };
      state.currentTrip = action.payload;
      state.error = null;
    },

    // 规划失败
    planningFailure: (state, action: PayloadAction<string>) => {
      state.isPlanning = false;
      state.planningProgress = { progress: 0, message: '' };
      state.error = action.payload;
    },

    // 保存行程
    saveTrip: (state, action: PayloadAction<TripPlan>) => {
      const existingIndex = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (existingIndex >= 0) {
        state.trips[existingIndex] = action.payload;
      } else {
        state.trips.push(action.payload);
      }
    },

    // 删除行程
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      if (state.currentTrip?.id === action.payload) {
        state.currentTrip = null;
      }
    },

    // 设置当前行程
    setCurrentTrip: (state, action: PayloadAction<TripPlan>) => {
      state.currentTrip = action.payload;
    },

    // 清空当前行程
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    },

    // 加载用户行程列表
    loadTrips: (state, action: PayloadAction<TripPlan[]>) => {
      state.trips = action.payload;
    },

    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取行程列表
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
        state.error = null;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 创建行程
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.push(action.payload);
        state.error = null;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 规划行程路线
      .addCase(planTripRoute.pending, (state) => {
        state.isPlanning = true;
        state.planningProgress = { progress: 10, message: '正在规划路线...' };
        state.error = null;
      })
      .addCase(planTripRoute.fulfilled, (state, action) => {
        state.isPlanning = false;
        state.planningProgress = { progress: 100, message: '规划完成' };
        state.currentTrip = action.payload;
        
        // 更新trips列表中的对应行程
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index >= 0) {
          state.trips[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(planTripRoute.rejected, (state, action) => {
        state.isPlanning = false;
        state.planningProgress = { progress: 0, message: '' };
        state.error = action.payload as string;
      })
      // 删除行程
      .addCase(deleteTripAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTripAsync.fulfilled, (state, action) => {
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
        if (state.currentTrip?.id === action.payload) {
          state.currentTrip = null;
        }
        state.error = null;
      })
      .addCase(deleteTripAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  startPlanning,
  updatePlanningProgress,
  planningSuccess,
  planningFailure,
  saveTrip,
  deleteTrip,
  setCurrentTrip,
  clearCurrentTrip,
  loadTrips,
  clearError,
} = tripSlice.actions;

export default tripSlice.reducer;