"""
行程管理路由
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
import json

from database import db
from models.user import User
from models.trip import Trip, POI, DayItinerary
from algorithms.route_optimizer import RouteOptimizer

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('/', methods=['GET'])
@jwt_required()
def get_trips():
    """获取用户的所有行程"""
    try:
        user_id = get_jwt_identity()
        
        # 获取查询参数
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 10)), 50)
        
        # 构建查询
        query = Trip.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        # 分页查询
        trips = query.order_by(Trip.updated_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'trips': [trip.to_dict() for trip in trips.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': trips.total,
                'pages': trips.pages,
                'has_next': trips.has_next,
                'has_prev': trips.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取行程列表失败: {str(e)}'}), 500

@trips_bp.route('/', methods=['POST'])
@jwt_required()
def create_trip():
    """创建新行程"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        # 验证必填字段
        name = data.get('name', '').strip()
        total_days = data.get('totalDays')
        transport_mode = data.get('transportMode', 'driving')
        
        if not name:
            return jsonify({'error': '行程名称不能为空'}), 400
        
        if not total_days or total_days <= 0:
            return jsonify({'error': '行程天数必须大于0'}), 400
        
        # 创建行程
        trip = Trip(
            name=name,
            user_id=user_id,
            total_days=total_days,
            transport_mode=transport_mode
        )
        
        # 可选字段
        if data.get('startDate'):
            try:
                trip.start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': '开始日期格式错误，应为YYYY-MM-DD'}), 400
        
        if data.get('startTime'):
            trip.start_time = data['startTime']
        
        if data.get('endTime'):
            trip.end_time = data['endTime']
        
        db.session.add(trip)
        db.session.commit()
        
        return jsonify({
            'message': '行程创建成功',
            'trip': trip.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建行程失败: {str(e)}'}), 500

@trips_bp.route('/<trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    """获取单个行程详情"""
    try:
        user_id = get_jwt_identity()
        
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        return jsonify({
            'trip': trip.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取行程详情失败: {str(e)}'}), 500

@trips_bp.route('/<trip_id>', methods=['PUT'])
@jwt_required()
def update_trip(trip_id):
    """更新行程信息"""
    try:
        user_id = get_jwt_identity()
        
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        # 更新字段
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({'error': '行程名称不能为空'}), 400
            trip.name = name
        
        if 'totalDays' in data:
            total_days = data['totalDays']
            if not total_days or total_days <= 0:
                return jsonify({'error': '行程天数必须大于0'}), 400
            trip.total_days = total_days
        
        if 'transportMode' in data:
            trip.transport_mode = data['transportMode']
        
        if 'startDate' in data:
            if data['startDate']:
                try:
                    trip.start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': '开始日期格式错误，应为YYYY-MM-DD'}), 400
            else:
                trip.start_date = None
        
        if 'startTime' in data:
            trip.start_time = data['startTime']
        
        if 'endTime' in data:
            trip.end_time = data['endTime']
        
        if 'status' in data:
            trip.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': '行程更新成功',
            'trip': trip.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新行程失败: {str(e)}'}), 500

@trips_bp.route('/<trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    """删除行程"""
    try:
        user_id = get_jwt_identity()
        
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        db.session.delete(trip)
        db.session.commit()
        
        return jsonify({
            'message': '行程删除成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除行程失败: {str(e)}'}), 500

@trips_bp.route('/<trip_id>/pois', methods=['POST'])
@jwt_required()
def add_poi_to_trip(trip_id):
    """向行程添加POI"""
    try:
        user_id = get_jwt_identity()
        
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': '请求数据不能为空'}), 400
        
        # 验证必填字段
        name = data.get('name', '').strip()
        coordinates = data.get('coordinates', {})
        
        if not name:
            return jsonify({'error': 'POI名称不能为空'}), 400
        
        if not coordinates.get('lat') or not coordinates.get('lng'):
            return jsonify({'error': 'POI坐标不能为空'}), 400
        
        # 创建POI
        poi = POI(
            name=name,
            latitude=coordinates['lat'],
            longitude=coordinates['lng'],
            trip_id=trip_id
        )
        
        # 可选字段
        if data.get('address'):
            poi.address = data['address']
        
        if data.get('category'):
            poi.category = data['category']
        
        if data.get('description'):
            poi.description = data['description']
        
        if data.get('openHours'):
            poi.open_hours = data['openHours']
        
        if data.get('suggestedDuration'):
            poi.suggested_duration = data['suggestedDuration']
        
        if data.get('customDuration'):
            poi.custom_duration = data['customDuration']
        
        if data.get('isCustom'):
            poi.is_custom = data['isCustom']
        
        if data.get('imageUrl'):
            poi.image_url = data['imageUrl']
        
        db.session.add(poi)
        db.session.commit()
        
        return jsonify({
            'message': 'POI添加成功',
            'poi': poi.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'添加POI失败: {str(e)}'}), 500

@trips_bp.route('/<trip_id>/pois/<poi_id>', methods=['DELETE'])
@jwt_required()
def remove_poi_from_trip(trip_id, poi_id):
    """从行程中移除POI"""
    try:
        user_id = get_jwt_identity()
        
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        poi = POI.query.filter_by(id=poi_id, trip_id=trip_id).first()
        if not poi:
            return jsonify({'error': 'POI不存在'}), 404
        
        db.session.delete(poi)
        db.session.commit()
        
        return jsonify({
            'message': 'POI移除成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'移除POI失败: {str(e)}'}), 500

@trips_bp.route('/<int:trip_id>/plan', methods=['POST'])
@jwt_required()
def plan_trip(trip_id):
    """规划行程路线"""
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '行程不存在'}), 404
        
        # 获取行程的所有POI
        pois = POI.query.filter_by(trip_id=trip_id).all()
        
        if not pois:
            return jsonify({'error': '行程中没有POI'}), 400
        
        # 转换POI数据格式以供算法使用
        poi_data = []
        for poi in pois:
            poi_data.append({
                'id': poi.id,
                'name': poi.name,
                'coordinates': {
                    'lat': poi.latitude,
                    'lng': poi.longitude
                },
                'suggestedDuration': poi.suggested_duration or 60,
                'category': poi.category
            })
        
        # 使用路线优化算法
        optimizer = RouteOptimizer()
        optimization_result = optimizer.optimize_trip(
            pois=poi_data,
            num_days=trip.total_days,
            daily_time_limit=480  # 8小时
        )
        
        if not optimization_result['success']:
            return jsonify({'error': optimization_result['error']}), 400
        
        # 清除现有的日程安排
        DayItinerary.query.filter_by(trip_id=trip_id).delete()
        
        # 创建优化后的日程安排
        for day_data in optimization_result['days']:
            if not day_data['pois']:
                continue
                
            poi_sequence = [poi['id'] for poi in day_data['pois']]
            
            day_itinerary = DayItinerary(
                trip_id=trip_id,
                day=day_data['day'],
                date=trip.start_date + timedelta(days=day_data['day']-1) if trip.start_date else None,
                poi_sequence=poi_sequence,
                routes_data={
                    'routes': day_data['routes']
                },
                total_duration=day_data['total_duration'],
                total_distance=day_data['total_distance']
            )
            
            db.session.add(day_itinerary)
        
        # 更新行程状态
        trip.status = 'planned'
        db.session.commit()
        
        return jsonify({
            'message': '行程规划完成',
            'trip_id': trip_id,
            'optimization_result': optimization_result
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500