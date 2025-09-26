# 智能旅行路线规划Web应用

一个基于AI算法的智能旅行路线规划系统，能够自动优化景点游览顺序，最大化旅行效率。

## 功能特点

- 🗺️ **智能路线规划**: 基于K-means聚类和TSP算法的路线优化
- 📍 **POI管理**: 支持系统景点库和自定义地点添加
- ⏰ **时间优化**: 考虑交通时间、游玩时长和营业时间
- 📱 **响应式设计**: 支持桌面和移动设备
- 📤 **导出分享**: 支持PDF导出和链接分享

## 技术栈

### 前端
- React 18 + TypeScript
- Redux Toolkit (状态管理)
- Ant Design (UI组件库)
- Leaflet (地图库)
- React Router (路由)

### 后端
- Python Flask
- PostgreSQL + PostGIS (地理数据库)
- Redis (缓存)
- scikit-learn (机器学习)
- JWT (身份认证)

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd travelmap
```

2. **安装前端依赖**
```bash
cd frontend
npm install
```

3. **安装后端依赖**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入相应的配置信息
```

5. **启动服务**

启动后端：
```bash
cd backend
python app.py
```

启动前端：
```bash
cd frontend
npm start
```

访问 http://localhost:3000 查看应用。

## 核心算法

### 路线优化流程
1. **地理聚类**: 使用K-means算法将POI按地理位置分组到不同天数
2. **路径优化**: 对每天的POI使用TSP算法优化游览顺序
3. **时间校验**: 验证每日行程的可行性并进行负载均衡
4. **约束处理**: 考虑营业时间、交通方式等约束条件

## 项目结构

```
travelmap/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Redux状态管理
│   │   ├── services/      # API服务
│   │   ├── types/         # TypeScript类型定义
│   │   └── utils/         # 工具函数
│   └── public/
├── backend/           # Python Flask后端
│   ├── app.py            # 应用入口
│   ├── models/           # 数据模型
│   ├── routes/           # API路由
│   ├── services/         # 业务逻辑
│   └── algorithms/       # 核心算法
├── database/          # 数据库脚本
├── docker/            # Docker配置
└── docs/              # 文档
```

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License