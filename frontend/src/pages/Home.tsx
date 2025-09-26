import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Divider } from 'antd';
import { 
  RocketOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  ShareAltOutlined,
  BulbOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

/**
 * 主页组件
 * 展示应用介绍、核心功能和快速开始入口
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BulbOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: '智能路线规划',
      description: '基于K-means聚类和TSP算法，自动生成最优游览路线，最大化时间利用效率。',
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'POI管理',
      description: '丰富的景点数据库，支持自定义地点添加，灵活管理您的愿望清单。',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: '时间优化',
      description: '考虑营业时间、交通耗时和游玩时长，确保行程安排合理可行。',
    },
    {
      icon: <ShareAltOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
      title: '导出分享',
      description: '支持PDF导出和链接分享，方便与朋友分享您的精彩行程。',
    },
  ];

  const handleStartPlanning = () => {
    navigate('/plan');
  };

  const handleViewTrips = () => {
    navigate('/trips');
  };

  return (
    <div className="home-page">
      {/* 英雄区域 */}
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1} className="hero-title">
            智能旅行路线规划
          </Title>
          <Paragraph className="hero-description" style={{ fontSize: '18px' }}>
            让AI为您规划最优旅行路线，告别繁琐的行程安排，享受智能化的旅行体验
          </Paragraph>
          <Space size="large" className="hero-actions">
            <Button 
              type="primary" 
              size="large" 
              icon={<RocketOutlined />}
              onClick={handleStartPlanning}
            >
              开始规划
            </Button>
            <Button 
              size="large" 
              icon={<TeamOutlined />}
              onClick={handleViewTrips}
            >
              我的行程
            </Button>
          </Space>
        </div>
      </div>

      <Divider />

      {/* 核心功能介绍 */}
      <div className="features-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            核心功能
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="feature-card"
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                >
                  <div className="feature-icon" style={{ marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <Divider />

      {/* 使用流程 */}
      <div className="process-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            使用流程
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <Card className="process-card" style={{ textAlign: 'center' }}>
                <div className="process-number">1</div>
                <Title level={4}>选择景点</Title>
                <Paragraph>
                  从丰富的景点库中选择心仪的地点，或在地图上添加自定义位置
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="process-card" style={{ textAlign: 'center' }}>
                <div className="process-number">2</div>
                <Title level={4}>设置参数</Title>
                <Paragraph>
                  设定旅行天数、交通方式和每个景点的游玩时长
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="process-card" style={{ textAlign: 'center' }}>
                <div className="process-number">3</div>
                <Title level={4}>生成路线</Title>
                <Paragraph>
                  一键生成最优路线，支持手动调整和实时优化
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Divider />

      {/* 算法介绍 */}
      <div className="algorithm-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            核心算法
          </Title>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <Card>
                <Title level={3}>K-means 聚类算法</Title>
                <Paragraph>
                  将景点按地理位置进行智能分组，确保同一天游览的景点在地理上相对集中，
                  减少不必要的往返交通时间。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card>
                <Title level={3}>TSP 路径优化</Title>
                <Paragraph>
                  对每日的景点序列进行旅行商问题求解，找到最短路径，
                  优化游览顺序，提升时间利用效率。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* 快速开始 */}
      <div className="cta-section">
        <Card className="cta-card">
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>准备开始您的智能旅行规划了吗？</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              只需几分钟，就能为您生成完美的旅行路线
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              icon={<RocketOutlined />}
              onClick={handleStartPlanning}
            >
              立即开始规划
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;