"""
POI管理路由
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os

from database import db
from models.trip import POI

pois_bp = Blueprint('pois', __name__, url_prefix='/api/pois')

@pois_bp.route('/search', methods=['GET'])
@jwt_required()
def search_pois():
    """搜索POI"""
    try:
        # 获取查询参数
        query = request.args.get('q', '').strip()
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', 5000)  # 默认5km
        
        if not query:
            return jsonify({'error': '搜索关键词不能为空'}), 400
        
        # 模拟POI搜索结果
        # 在实际应用中，这里应该调用地图API（如高德地图、百度地图等）
        mock_pois = [
            {
                'id': f'poi_{i}',
                'name': f'{query}相关地点{i}',
                'coordinates': {
                    'lat': float(lat) + (i * 0.001) if lat else 39.9042 + (i * 0.001),
                    'lng': float(lng) + (i * 0.001) if lng else 116.4074 + (i * 0.001)
                },
                'address': f'北京市朝阳区某某街道{i}号',
                'category': '景点',
                'description': f'这是一个关于{query}的地点描述',
                'openHours': '09:00-18:00',
                'suggestedDuration': 60 + (i * 30),
                'imageUrl': f'https://example.com/image_{i}.jpg'
            }
            for i in range(1, 6)
        ]
        
        return jsonify({
            'pois': mock_pois,
            'total': len(mock_pois)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'搜索POI失败: {str(e)}'}), 500

@pois_bp.route('/nearby', methods=['GET'])
@jwt_required()
def get_nearby_pois():
    """获取附近POI"""
    try:
        # 获取查询参数
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', 1000)  # 默认1km
        category = request.args.get('category')
        
        if not lat or not lng:
            return jsonify({'error': '经纬度不能为空'}), 400
        
        try:
            lat = float(lat)
            lng = float(lng)
            radius = int(radius)
        except ValueError:
            return jsonify({'error': '经纬度或半径格式错误'}), 400
        
        # 模拟附近POI数据
        # 在实际应用中，这里应该调用地图API
        categories = ['餐厅', '景点', '购物', '酒店', '交通'] if not category else [category]
        
        mock_pois = []
        for i, cat in enumerate(categories):
            for j in range(3):
                mock_pois.append({
                    'id': f'nearby_{cat}_{j}',
                    'name': f'{cat}{j+1}',
                    'coordinates': {
                        'lat': lat + (i * 0.001) + (j * 0.0005),
                        'lng': lng + (i * 0.001) + (j * 0.0005)
                    },
                    'address': f'附近的{cat}地址{j+1}',
                    'category': cat,
                    'description': f'这是一个{cat}',
                    'openHours': '09:00-21:00',
                    'suggestedDuration': 30 + (j * 15),
                    'distance': 100 + (i * 200) + (j * 50),  # 距离（米）
                    'imageUrl': f'https://example.com/{cat}_{j}.jpg'
                })
        
        return jsonify({
            'pois': mock_pois,
            'total': len(mock_pois)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取附近POI失败: {str(e)}'}), 500

@pois_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_poi_categories():
    """获取POI分类"""
    try:
        categories = [
            {'id': 'restaurant', 'name': '餐厅', 'icon': 'restaurant'},
            {'id': 'attraction', 'name': '景点', 'icon': 'camera'},
            {'id': 'shopping', 'name': '购物', 'icon': 'shopping'},
            {'id': 'hotel', 'name': '酒店', 'icon': 'bed'},
            {'id': 'transport', 'name': '交通', 'icon': 'car'},
            {'id': 'entertainment', 'name': '娱乐', 'icon': 'game'},
            {'id': 'culture', 'name': '文化', 'icon': 'book'},
            {'id': 'nature', 'name': '自然', 'icon': 'tree'},
            {'id': 'sports', 'name': '运动', 'icon': 'football'},
            {'id': 'medical', 'name': '医疗', 'icon': 'medical'}
        ]
        
        return jsonify({
            'categories': categories
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取POI分类失败: {str(e)}'}), 500

@pois_bp.route('/<poi_id>', methods=['GET'])
@jwt_required()
def get_poi_detail(poi_id):
    """获取POI详情"""
    try:
        # 如果是数据库中的POI
        poi = POI.query.get(poi_id)
        if poi:
            return jsonify({
                'poi': poi.to_dict()
            }), 200
        
        # 如果是外部POI，返回模拟数据
        # 在实际应用中，这里应该调用地图API获取详情
        mock_poi = {
            'id': poi_id,
            'name': f'POI详情_{poi_id}',
            'coordinates': {
                'lat': 39.9042,
                'lng': 116.4074
            },
            'address': '北京市朝阳区某某街道123号',
            'category': '景点',
            'description': '这是一个详细的POI描述，包含了该地点的历史、特色、开放时间等信息。',
            'openHours': '周一至周日 09:00-18:00',
            'suggestedDuration': 120,
            'phone': '010-12345678',
            'website': 'https://example.com',
            'rating': 4.5,
            'reviews': 1234,
            'price': '免费',
            'tags': ['热门', '必去', '拍照'],
            'images': [
                'https://example.com/image1.jpg',
                'https://example.com/image2.jpg',
                'https://example.com/image3.jpg'
            ],
            'facilities': ['停车场', 'WiFi', '无障碍通道', '餐厅'],
            'tips': [
                '建议提前预约',
                '周末人较多，建议工作日前往',
                '可以带相机拍照'
            ]
        }
        
        return jsonify({
            'poi': mock_poi
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取POI详情失败: {str(e)}'}), 500

@pois_bp.route('/custom', methods=['POST'])
@jwt_required()
def create_custom_poi():
    """创建自定义POI"""
    try:
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
        
        # 创建自定义POI
        poi = POI(
            name=name,
            latitude=coordinates['lat'],
            longitude=coordinates['lng'],
            is_custom=True
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
        
        if data.get('customDuration'):
            poi.custom_duration = data['customDuration']
        
        if data.get('imageUrl'):
            poi.image_url = data['imageUrl']
        
        db.session.add(poi)
        db.session.commit()
        
        return jsonify({
            'message': '自定义POI创建成功',
            'poi': poi.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建自定义POI失败: {str(e)}'}), 500

@pois_bp.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    """获取用户愿望清单"""
    try:
        user_id = get_jwt_identity()
        
        # 获取用户的自定义POI（未分配到行程的）
        wishlist_pois = POI.query.filter_by(
            trip_id=None,
            is_custom=True
        ).all()
        
        return jsonify({
            'pois': [poi.to_dict() for poi in wishlist_pois],
            'total': len(wishlist_pois)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取愿望清单失败: {str(e)}'}), 500