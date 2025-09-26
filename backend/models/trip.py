"""
行程相关模型
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

# 从database.py导入db实例
from database import db

class Trip(db.Model):
    """行程模型"""
    __tablename__ = 'trips'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    total_days = db.Column(db.Integer, nullable=False)
    transport_mode = db.Column(db.String(20), nullable=False)  # driving, walking, transit, cycling
    start_date = db.Column(db.Date, nullable=True)
    start_time = db.Column(db.String(10), nullable=True)  # HH:MM格式
    end_time = db.Column(db.String(10), nullable=True)    # HH:MM格式
    status = db.Column(db.String(20), default='draft')    # draft, completed, archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    pois = db.relationship('POI', backref='trip', lazy=True, cascade='all, delete-orphan')
    day_itineraries = db.relationship('DayItinerary', backref='trip', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'total_days': self.total_days,
            'transport_mode': self.transport_mode,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'pois': [poi.to_dict() for poi in self.pois],
            'day_itineraries': [day.to_dict() for day in self.day_itineraries]
        }
    
    def __repr__(self):
        return f'<Trip {self.name}>'

class POI(db.Model):
    """兴趣点模型"""
    __tablename__ = 'pois'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    open_hours = db.Column(db.String(200), nullable=True)
    suggested_duration = db.Column(db.Integer, nullable=True)  # 分钟
    custom_duration = db.Column(db.Integer, nullable=True)     # 分钟
    is_custom = db.Column(db.Boolean, default=False)
    image_url = db.Column(db.String(500), nullable=True)
    trip_id = db.Column(db.String(36), db.ForeignKey('trips.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'coordinates': {
                'lat': self.latitude,
                'lng': self.longitude
            },
            'address': self.address,
            'category': self.category,
            'description': self.description,
            'openHours': self.open_hours,
            'suggestedDuration': self.suggested_duration,
            'customDuration': self.custom_duration,
            'isCustom': self.is_custom,
            'imageUrl': self.image_url,
            'tripId': self.trip_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<POI {self.name}>'

class DayItinerary(db.Model):
    """单日行程模型"""
    __tablename__ = 'day_itineraries'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = db.Column(db.String(36), db.ForeignKey('trips.id'), nullable=False)
    day = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=True)
    poi_sequence = db.Column(db.Text, nullable=True)  # JSON格式存储POI顺序
    routes_data = db.Column(db.Text, nullable=True)   # JSON格式存储路线信息
    total_duration = db.Column(db.Integer, nullable=True)  # 分钟
    total_distance = db.Column(db.Float, nullable=True)    # 米
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_poi_sequence(self):
        """获取POI顺序"""
        if self.poi_sequence:
            return json.loads(self.poi_sequence)
        return []
    
    def set_poi_sequence(self, sequence):
        """设置POI顺序"""
        self.poi_sequence = json.dumps(sequence)
    
    def get_routes_data(self):
        """获取路线数据"""
        if self.routes_data:
            return json.loads(self.routes_data)
        return []
    
    def set_routes_data(self, routes):
        """设置路线数据"""
        self.routes_data = json.dumps(routes)
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'day': self.day,
            'date': self.date.isoformat() if self.date else None,
            'poi_sequence': self.get_poi_sequence(),
            'routes': self.get_routes_data(),
            'total_duration': self.total_duration,
            'total_distance': self.total_distance,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<DayItinerary Trip:{self.trip_id} Day:{self.day}>'