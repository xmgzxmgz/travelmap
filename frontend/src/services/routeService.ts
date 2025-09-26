import { POI, RouteInfo, TransportMode, Coordinates } from '../types';

/**
 * 路线规划服务
 * 提供真实的路线计算和时间预估
 */

// 交通方式速度配置（公里/小时）
const TRANSPORT_SPEEDS = {
  [TransportMode.WALKING]: 5,     // 步行 5km/h
  [TransportMode.CYCLING]: 15,    // 骑行 15km/h  
  [TransportMode.DRIVING]: 40,    // 驾车 40km/h（城市道路平均）
  [TransportMode.TRANSIT]: 25,    // 公共交通 25km/h（包含等车时间）
};

// 交通方式基础费用（元）
const TRANSPORT_BASE_COSTS = {
  [TransportMode.WALKING]: 0,
  [TransportMode.CYCLING]: 0,
  [TransportMode.DRIVING]: 10,    // 停车费
  [TransportMode.TRANSIT]: 3,     // 地铁/公交起步价
};

// 交通方式距离费用（元/公里）
const TRANSPORT_DISTANCE_COSTS = {
  [TransportMode.WALKING]: 0,
  [TransportMode.CYCLING]: 0,
  [TransportMode.DRIVING]: 2,     // 油费
  [TransportMode.TRANSIT]: 0.5,   // 按距离计费
};

/**
 * 计算两点间的直线距离（哈弗辛公式）
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // 地球半径（公里）
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 根据交通方式调整实际距离
 */
function adjustDistanceByTransport(directDistance: number, mode: TransportMode): number {
  const factors = {
    [TransportMode.WALKING]: 1.3,   // 步行需要绕路
    [TransportMode.CYCLING]: 1.2,   // 骑行稍微绕路
    [TransportMode.DRIVING]: 1.4,   // 驾车需要走道路
    [TransportMode.TRANSIT]: 1.5,   // 公共交通路线较长
  };
  return directDistance * factors[mode];
}

/**
 * 计算考虑交通状况的实际时间
 */
function calculateRealTime(distance: number, mode: TransportMode, hour: number = 14): number {
  const baseSpeed = TRANSPORT_SPEEDS[mode];
  
  // 交通高峰期调整系数
  let trafficFactor = 1;
  if (mode === TransportMode.DRIVING || mode === TransportMode.TRANSIT) {
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      trafficFactor = 0.6; // 高峰期速度降低40%
    } else if (hour >= 22 || hour <= 6) {
      trafficFactor = 1.2; // 夜间速度提高20%
    }
  }
  
  const adjustedSpeed = baseSpeed * trafficFactor;
  const timeInHours = distance / adjustedSpeed;
  
  // 添加等待时间
  let waitTime = 0;
  if (mode === TransportMode.TRANSIT) {
    waitTime = 5; // 公共交通等车时间5分钟
  } else if (mode === TransportMode.DRIVING) {
    waitTime = 2; // 驾车找停车位时间2分钟
  }
  
  return Math.round(timeInHours * 60 + waitTime); // 转换为分钟
}

/**
 * 计算交通费用
 */
function calculateTransportCost(distance: number, mode: TransportMode): number {
  const baseCost = TRANSPORT_BASE_COSTS[mode];
  const distanceCost = distance * TRANSPORT_DISTANCE_COSTS[mode];
  return Math.round((baseCost + distanceCost) * 100) / 100; // 保留两位小数
}

/**
 * 生成简化的路线途经点
 */
function generateWaypoints(from: Coordinates, to: Coordinates, mode: TransportMode): Coordinates[] {
  const waypoints: Coordinates[] = [from];
  
  // 根据距离决定途经点数量
  const distance = calculateDistance(from, to);
  const numWaypoints = Math.min(Math.floor(distance / 2), 5); // 每2公里一个途经点，最多5个
  
  for (let i = 1; i <= numWaypoints; i++) {
    const ratio = i / (numWaypoints + 1);
    const lat = from.lat + (to.lat - from.lat) * ratio;
    const lng = from.lng + (to.lng - from.lng) * ratio;
    
    // 添加一些随机偏移来模拟真实路线
    const offset = 0.001 * (Math.random() - 0.5);
    waypoints.push({
      lat: lat + offset,
      lng: lng + offset
    });
  }
  
  waypoints.push(to);
  return waypoints;
}

/**
 * 计算两个POI之间的路线信息
 */
export async function calculateRoute(
  fromPOI: POI, 
  toPOI: POI, 
  mode: TransportMode,
  currentHour: number = 14
): Promise<RouteInfo> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const directDistance = calculateDistance(fromPOI.coordinates, toPOI.coordinates);
  const actualDistance = adjustDistanceByTransport(directDistance, mode);
  const duration = calculateRealTime(actualDistance, mode, currentHour);
  const cost = calculateTransportCost(actualDistance, mode);
  const waypoints = generateWaypoints(fromPOI.coordinates, toPOI.coordinates, mode);
  
  return {
    from: fromPOI.id,
    to: toPOI.id,
    duration,
    distance: Math.round(actualDistance * 1000), // 转换为米
    mode,
    cost,
    waypoints,
    instructions: generateInstructions(fromPOI, toPOI, mode, duration),
    polyline: encodePolyline(waypoints)
  };
}

/**
 * 生成路线说明
 */
function generateInstructions(from: POI, to: POI, mode: TransportMode, duration: number): string {
  const modeText = {
    [TransportMode.WALKING]: '步行',
    [TransportMode.CYCLING]: '骑行',
    [TransportMode.DRIVING]: '驾车',
    [TransportMode.TRANSIT]: '公共交通'
  };
  
  return `${modeText[mode]}从${from.name}到${to.name}，预计用时${duration}分钟`;
}

/**
 * 简化的polyline编码（实际应用中应使用Google的polyline算法）
 */
function encodePolyline(waypoints: Coordinates[]): string {
  return waypoints.map(point => `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`).join('|');
}

/**
 * 优化多个POI的访问顺序
 */
export function optimizePOIOrder(pois: POI[], mode: TransportMode): POI[] {
  if (pois.length <= 2) return pois;
  
  // 简单的最近邻算法
  const optimized: POI[] = [pois[0]];
  const remaining = [...pois.slice(1)];
  
  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    remaining.forEach((poi, index) => {
      const distance = calculateDistance(current.coordinates, poi.coordinates);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    
    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  
  return optimized;
}

/**
 * 计算景点的建议停留时间（考虑实际因素）
 */
export function calculateStayDuration(poi: POI, timeOfDay: number): number {
  let baseDuration = poi.suggestedDuration || 60;
  
  // 根据景点类型调整
  const categoryAdjustments: { [key: string]: number } = {
    '博物馆': 1.2,
    '公园': 1.1,
    '历史遗迹': 1.0,
    '商业街': 0.8,
    '餐厅': 0.7,
    '观景台': 0.6,
  };
  
  const adjustment = categoryAdjustments[poi.category || ''] || 1.0;
  baseDuration *= adjustment;
  
  // 根据时间调整（避开用餐时间等）
  if (poi.category === '餐厅') {
    if (timeOfDay >= 11 && timeOfDay <= 13) baseDuration *= 1.5; // 午餐时间
    if (timeOfDay >= 17 && timeOfDay <= 19) baseDuration *= 1.5; // 晚餐时间
  }
  
  return Math.round(baseDuration);
}