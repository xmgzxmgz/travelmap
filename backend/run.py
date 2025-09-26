#!/usr/bin/env python3
"""
Flask应用启动脚本
"""

from app import create_app
import os

if __name__ == '__main__':
    app = create_app()
    
    # 从环境变量获取配置
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"启动Flask应用...")
    print(f"地址: http://{host}:{port}")
    print(f"调试模式: {debug}")
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )