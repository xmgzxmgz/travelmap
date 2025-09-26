// 地理坐标类型
export interface Coordinates {
  lat: number;
  lng: number;
}

// POI（兴趣点）类型
export interface POI {
  id: string;
  name: string;
  coordinates: Coordinates;
  address?: string;
  category?: string;
  description?: string;
  openHours?: string;
  suggestedDuration?: number; // 建议游玩时长（分钟）
  customDuration?: number; // 用户自定义时长（分钟）
  isCustom: boolean; // 是否为用户自定义POI
  imageUrl?: string;
  hotRank?: number; // 热度排名（1-50）
  rating?: number; // 评分（1-5）
  ticketPrice?: number; // 门票价格（元）
  isOrigin?: boolean; // 是否为出发地
  isDestination?: boolean; // 是否为目的地
}

// 交通方式枚举
export enum TransportMode {
  DRIVING = 'driving',
  WALKING = 'walking',
  TRANSIT = 'transit',
  CYCLING = 'cycling'
}

// 路径信息
export interface RouteInfo {
  from: string;
  to: string;
  duration: number; // 分钟
  distance: number; // 米
  mode: TransportMode;
  instructions?: string;
  cost?: number; // 交通费用（元）
  waypoints?: Coordinates[]; // 途经点坐标
  polyline?: string; // 路线编码字符串
}

// 单日行程
export interface DayItinerary {
  day: number;
  date?: string;
  pois: POI[];
  routes: RouteInfo[];
  totalDuration: number; // 总时长（分钟）
  totalDistance: number; // 总距离（米）
}

// 完整行程
export interface TripPlan {
  id: string;
  name: string;
  description?: string;
  userId?: string;
  totalDays: number;
  transportMode: TransportMode;
  dailyItineraries: DayItinerary[];
  itinerary?: DayItinerary[]; // 别名，兼容性
  createdAt: string;
  updatedAt: string;
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 地图状态
export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedPOIs: POI[];
  customPOIs: POI[];
  currentTrip?: TripPlan;
}

// 应用状态
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 行程规划请求
export interface PlanTripRequest {
  pois: POI[];
  totalDays: number;
  transportMode: TransportMode;
  startDate?: string;
  startTime?: string;
  endTime?: string;
}

// 规划进度信息
export interface PlanningProgress {
  progress: number;
  message: string;
}