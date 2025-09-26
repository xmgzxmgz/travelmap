"""Travel Map 后端应用主文件"""

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

# 导入数据库实例
from database import db

# 加载环境变量
load_dotenv()

# 创建扩展实例
jwt = JWTManager()

def create_app():
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///travelmap.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    
    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # 导入模型（确保在db初始化后）
    from models.user import User
    from models.trip import Trip, POI, DayItinerary
    
    # 导入并注册蓝图
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.pois import pois_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(pois_bp)

    # 健康检查端点
    @app.route('/health')
    def health_check():
        """健康检查"""
        return jsonify({
            'status': 'healthy',
            'message': 'Travel Map API is running'
        }), 200
    
    # API信息端点
    @app.route('/api')
    def api_info():
        """API信息"""
        return jsonify({
            'name': 'Travel Map API',
            'version': '1.0.0',
            'description': '智能旅行路线规划API'
        }), 200
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        """404错误处理"""
        return jsonify({
            'error': '请求的资源不存在'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """500错误处理"""
        return jsonify({
            'error': '服务器内部错误'
        }), 500
    
    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    # 运行应用
    app.run(debug=True, host='0.0.0.0', port=5000)