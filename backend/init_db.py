#!/usr/bin/env python3
"""
数据库初始化脚本
创建所有数据表并添加示例数据
"""

from app import create_app
from database import db
from models.user import User
from models.trip import Trip, POI, DayItinerary
from datetime import datetime, timedelta
import os

def init_database():
    """初始化数据库"""
    app = create_app()
    
    with app.app_context():
        # 删除所有表（谨慎使用）
        print("正在删除现有表...")
        db.drop_all()
        
        # 创建所有表
        print("正在创建数据表...")
        db.create_all()
        
        # 添加示例用户
        print("正在添加示例数据...")
        
        # 创建测试用户
        test_user = User(
            email='test@example.com',
            password='password123',
            name='测试用户'
        )
        db.session.add(test_user)
        db.session.commit()
        
        # 创建示例行程
        sample_trip = Trip(
            name='北京三日游',
            user_id=test_user.id,
            total_days=3,
            transport_mode='driving',
            start_date=datetime.now().date(),
            start_time='09:00',
            end_time='18:00',
            status='draft'
        )
        db.session.add(sample_trip)
        db.session.commit()
        
        # 添加示例POI
        sample_pois = [
            {
                'name': '天安门广场',
                'latitude': 39.9042,
                'longitude': 116.4074,
                'address': '北京市东城区天安门广场',
                'category': '景点',
                'description': '中华人民共和国的象征',
                'suggested_duration': 120
            },
            {
                'name': '故宫博物院',
                'latitude': 39.9163,
                'longitude': 116.3972,
                'address': '北京市东城区景山前街4号',
                'category': '景点',
                'description': '明清两朝的皇家宫殿',
                'suggested_duration': 180
            },
            {
                'name': '颐和园',
                'latitude': 39.9999,
                'longitude': 116.2755,
                'address': '北京市海淀区新建宫门路19号',
                'category': '景点',
                'description': '中国古典园林之首',
                'suggested_duration': 150
            },
            {
                'name': '长城（八达岭）',
                'latitude': 40.3584,
                'longitude': 116.0138,
                'address': '北京市延庆区八达岭镇',
                'category': '景点',
                'description': '万里长城的精华段',
                'suggested_duration': 240
            },
            {
                'name': '王府井大街',
                'latitude': 39.9097,
                'longitude': 116.4180,
                'address': '北京市东城区王府井大街',
                'category': '购物',
                'description': '北京著名商业街',
                'suggested_duration': 90
            }
        ]
        
        for poi_data in sample_pois:
            poi = POI(
                trip_id=sample_trip.id,
                **poi_data
            )
            db.session.add(poi)
        
        db.session.commit()
        
        print("数据库初始化完成！")
        print(f"测试用户: {test_user.email}")
        print(f"示例行程: {sample_trip.name}")
        print(f"POI数量: {len(sample_pois)}")

if __name__ == '__main__':
    init_database()