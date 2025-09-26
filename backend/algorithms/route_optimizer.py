"""
路线优化算法
使用K-means聚类和TSP算法优化旅行路线
"""

import numpy as np
from sklearn.cluster import KMeans
from geopy.distance import geodesic
import itertools
from typing import List, Dict, Tuple, Any
import math

class RouteOptimizer:
    """路线优化器"""
    
    def __init__(self):
        self.distance_cache = {}
    
    def calculate_distance(self, poi1: Dict, poi2: Dict) -> float:
        """
        计算两个POI之间的距离（公里）
        
        Args:
            poi1: 第一个POI，包含coordinates字段
            poi2: 第二个POI，包含coordinates字段
            
        Returns:
            距离（公里）
        """
        coord1 = (poi1['coordinates']['lat'], poi1['coordinates']['lng'])
        coord2 = (poi2['coordinates']['lat'], poi2['coordinates']['lng'])
        
        # 使用缓存避免重复计算
        cache_key = (coord1, coord2)
        if cache_key in self.distance_cache:
            return self.distance_cache[cache_key]
        
        distance = geodesic(coord1, coord2).kilometers
        self.distance_cache[cache_key] = distance
        self.distance_cache[(coord2, coord1)] = distance  # 对称缓存
        
        return distance
    
    def cluster_pois(self, pois: List[Dict], num_days: int) -> List[List[Dict]]:
        """
        使用K-means聚类将POI分组到不同天数
        
        Args:
            pois: POI列表
            num_days: 天数
            
        Returns:
            每天的POI列表
        """
        if len(pois) <= num_days:
            # 如果POI数量少于天数，每天分配一个POI
            return [[poi] for poi in pois] + [[] for _ in range(num_days - len(pois))]
        
        # 提取坐标
        coordinates = np.array([
            [poi['coordinates']['lat'], poi['coordinates']['lng']] 
            for poi in pois
        ])
        
        # K-means聚类
        kmeans = KMeans(n_clusters=num_days, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(coordinates)
        
        # 按聚类分组POI
        clustered_pois = [[] for _ in range(num_days)]
        for i, label in enumerate(cluster_labels):
            clustered_pois[label].append(pois[i])
        
        # 确保每天至少有一个POI（如果可能）
        empty_days = [i for i, day_pois in enumerate(clustered_pois) if not day_pois]
        full_days = [i for i, day_pois in enumerate(clustered_pois) if len(day_pois) > 1]
        
        # 重新分配POI以平衡各天
        for empty_day in empty_days:
            if full_days:
                # 从POI最多的天移动一个POI到空天
                fullest_day = max(full_days, key=lambda x: len(clustered_pois[x]))
                if len(clustered_pois[fullest_day]) > 1:
                    poi_to_move = clustered_pois[fullest_day].pop()
                    clustered_pois[empty_day].append(poi_to_move)
                    
                    if len(clustered_pois[fullest_day]) <= 1:
                        full_days.remove(fullest_day)
        
        return clustered_pois
    
    def solve_tsp_greedy(self, pois: List[Dict]) -> List[Dict]:
        """
        使用贪心算法解决TSP问题（适用于小规模问题）
        
        Args:
            pois: POI列表
            
        Returns:
            优化后的POI顺序
        """
        if len(pois) <= 1:
            return pois
        
        if len(pois) == 2:
            return pois
        
        # 对于小规模问题（<=8个POI），使用精确算法
        if len(pois) <= 8:
            return self._solve_tsp_exact(pois)
        
        # 对于大规模问题，使用贪心算法
        return self._solve_tsp_greedy_heuristic(pois)
    
    def _solve_tsp_exact(self, pois: List[Dict]) -> List[Dict]:
        """
        精确解决TSP问题（暴力搜索）
        
        Args:
            pois: POI列表
            
        Returns:
            最优POI顺序
        """
        if len(pois) <= 1:
            return pois
        
        min_distance = float('inf')
        best_route = pois
        
        # 固定第一个POI，排列其余POI
        first_poi = pois[0]
        remaining_pois = pois[1:]
        
        for permutation in itertools.permutations(remaining_pois):
            route = [first_poi] + list(permutation)
            total_distance = self._calculate_route_distance(route)
            
            if total_distance < min_distance:
                min_distance = total_distance
                best_route = route
        
        return best_route
    
    def _solve_tsp_greedy_heuristic(self, pois: List[Dict]) -> List[Dict]:
        """
        使用贪心启发式算法解决TSP问题
        
        Args:
            pois: POI列表
            
        Returns:
            优化后的POI顺序
        """
        if len(pois) <= 1:
            return pois
        
        # 从第一个POI开始
        route = [pois[0]]
        remaining = pois[1:]
        
        while remaining:
            current_poi = route[-1]
            # 找到距离当前POI最近的未访问POI
            nearest_poi = min(remaining, key=lambda poi: self.calculate_distance(current_poi, poi))
            route.append(nearest_poi)
            remaining.remove(nearest_poi)
        
        return route
    
    def _calculate_route_distance(self, route: List[Dict]) -> float:
        """
        计算路线总距离
        
        Args:
            route: POI路线
            
        Returns:
            总距离（公里）
        """
        if len(route) <= 1:
            return 0
        
        total_distance = 0
        for i in range(len(route) - 1):
            total_distance += self.calculate_distance(route[i], route[i + 1])
        
        return total_distance
    
    def optimize_trip(self, pois: List[Dict], num_days: int, 
                     daily_time_limit: int = 480, transport_mode: str = 'driving',
                     start_time: str = '09:00', is_weekend: bool = False) -> Dict[str, Any]:
        """
        优化整个行程
        
        Args:
            pois: POI列表
            num_days: 天数
            daily_time_limit: 每日时间限制（分钟），默认8小时
            
        Returns:
            优化后的行程安排
        """
        if not pois:
            return {
                'success': False,
                'error': 'POI列表不能为空'
            }
        
        if num_days <= 0:
            return {
                'success': False,
                'error': '天数必须大于0'
            }
        
        try:
            # 第一步：使用K-means聚类分组POI
            clustered_pois = self.cluster_pois(pois, num_days)
            
            # 第二步：为每天的POI优化顺序
            optimized_days = []
            total_distance = 0
            total_duration = 0
            
            for day_index, day_pois in enumerate(clustered_pois):
                if not day_pois:
                    optimized_days.append({
                        'day': day_index + 1,
                        'pois': [],
                        'routes': [],
                        'total_distance': 0,
                        'total_duration': 0,
                        'estimated_time': 0
                    })
                    continue
                
                # 优化当天POI顺序
                optimized_pois = self.solve_tsp_greedy(day_pois)
                
                # 计算路线信息
                routes = []
                day_distance = 0
                day_duration = 0
                
                # 解析开始时间
                start_hour = int(start_time.split(':')[0])
                current_time = start_hour
                
                for i in range(len(optimized_pois) - 1):
                    distance = self.calculate_distance(optimized_pois[i], optimized_pois[i + 1])
                    
                    # 使用改进的时间预估算法
                    travel_time = self.calculate_time_estimate(
                        distance_km=distance,
                        transport_mode=transport_mode,
                        time_of_day=int(current_time),
                        is_weekend=is_weekend
                    )
                    
                    # 计算费用
                    cost = self._calculate_transport_cost(distance, transport_mode)
                    
                    routes.append({
                        'from_poi_id': optimized_pois[i]['id'],
                        'to_poi_id': optimized_pois[i + 1]['id'],
                        'distance': round(distance * 1000, 0),  # 转换为米
                        'duration': travel_time,
                        'mode': transport_mode,
                        'cost': cost
                    })
                    
                    day_distance += distance
                    day_duration += travel_time
                    
                    # 更新当前时间（加上旅行时间）
                    current_time += travel_time / 60
                
                # 计算POI游览时间（使用改进的停留时间计算）
                poi_time = 0
                poi_current_time = start_hour  # 使用实际开始时间
                
                for poi in optimized_pois:
                    stay_duration = self.calculate_poi_stay_duration(poi, int(poi_current_time))
                    poi_time += stay_duration
                    poi_current_time += stay_duration / 60
                total_day_time = day_duration + poi_time
                
                optimized_days.append({
                    'day': day_index + 1,
                    'pois': optimized_pois,
                    'routes': routes,
                    'total_distance': round(day_distance, 2),
                    'total_duration': round(day_duration, 0),
                    'poi_time': poi_time,
                    'estimated_time': round(total_day_time, 0),
                    'time_exceeded': total_day_time > daily_time_limit
                })
                
                total_distance += day_distance
                total_duration += day_duration
            
            return {
                'success': True,
                'days': optimized_days,
                'summary': {
                    'total_distance': round(total_distance, 2),
                    'total_duration': round(total_duration, 0),
                    'total_pois': len(pois),
                    'num_days': num_days
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'路线优化失败: {str(e)}'
            }
    
    def calculate_time_estimate(self, distance_km: float, transport_mode: str = 'driving', 
                              time_of_day: int = 12, is_weekend: bool = False) -> int:
        """
        根据距离和交通方式估算时间（考虑现实因素）
        
        Args:
            distance_km: 距离（公里）
            transport_mode: 交通方式
            time_of_day: 一天中的小时（0-23）
            is_weekend: 是否为周末
            
        Returns:
            估算时间（分钟）
        """
        # 基础速度（km/h）
        base_speeds = {
            'driving': 40,    # 城市道路平均速度
            'walking': 5,     # 步行速度
            'cycling': 15,    # 骑行速度
            'transit': 25     # 公共交通平均速度
        }
        
        base_speed = base_speeds.get(transport_mode, 40)
        
        # 交通拥堵调整因子
        if transport_mode == 'driving':
            # 工作日高峰期调整
            if not is_weekend:
                if 7 <= time_of_day <= 9 or 17 <= time_of_day <= 19:
                    base_speed *= 0.6  # 高峰期速度降低40%
                elif 9 <= time_of_day <= 17:
                    base_speed *= 0.8  # 白天略有拥堵
            else:
                # 周末调整
                if 10 <= time_of_day <= 18:
                    base_speed *= 0.9  # 周末略有拥堵
        
        # 公共交通等车时间
        if transport_mode == 'transit':
            waiting_time = 8 if not is_weekend else 12  # 分钟
        else:
            waiting_time = 0
        
        # 计算行驶时间
        travel_time = (distance_km / base_speed) * 60  # 分钟
        
        # 添加额外时间（红绿灯、路口等）
        if transport_mode in ['driving', 'cycling']:
            # 每公里增加1-2分钟的额外时间
            extra_time = distance_km * 1.5
        else:
            extra_time = 0
        
        total_time = travel_time + waiting_time + extra_time
        return round(max(total_time, 1))  # 至少1分钟
    
    def calculate_poi_stay_duration(self, poi: Dict, time_of_day: int = 12) -> int:
        """
        计算景点的建议停留时间（考虑实际因素）
        
        Args:
            poi: POI信息
            time_of_day: 一天中的小时（0-23）
            
        Returns:
            建议停留时间（分钟）
        """
        base_duration = poi.get('suggestedDuration', 60)
        
        # 根据景点类型调整
        category_adjustments = {
            '博物馆': 1.2,
            '公园': 1.1,
            '历史遗迹': 1.0,
            '商业街': 0.8,
            '餐厅': 0.7,
            '观景台': 0.6,
            '寺庙': 0.8,
            '广场': 0.7,
            '建筑': 0.9
        }
        
        category = poi.get('category', '')
        adjustment = category_adjustments.get(category, 1.0)
        adjusted_duration = base_duration * adjustment
        
        # 根据时间调整（避开用餐时间等）
        if category == '餐厅':
            if 11 <= time_of_day <= 13:  # 午餐时间
                adjusted_duration *= 1.5
            elif 17 <= time_of_day <= 19:  # 晚餐时间
                adjusted_duration *= 1.5
        
        # 考虑景点开放时间
        if category in ['博物馆', '寺庙']:
            if time_of_day < 9 or time_of_day > 17:
                adjusted_duration *= 0.8  # 非正常开放时间
        
        return round(max(adjusted_duration, 15))  # 至少15分钟
    
    def _calculate_transport_cost(self, distance_km: float, transport_mode: str) -> int:
        """
        计算交通费用
        
        Args:
            distance_km: 距离（公里）
            transport_mode: 交通方式
            
        Returns:
            费用（元）
        """
        # 基础费用
        base_costs = {
            'walking': 0,
            'cycling': 0,
            'driving': 10,    # 停车费
            'transit': 3      # 地铁/公交起步价
        }
        
        # 距离费用（元/公里）
        distance_costs = {
            'walking': 0,
            'cycling': 0,
            'driving': 2,     # 油费
            'transit': 0.5    # 按距离计费
        }
        
        base_cost = base_costs.get(transport_mode, 0)
        distance_cost = distance_costs.get(transport_mode, 0) * distance_km
        
        return round(base_cost + distance_cost)