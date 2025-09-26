import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, Timeline, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShareAltOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import MapComponent from '../components/MapComponent';
import RouteExport from '../components/RouteExport';
import { POI } from '../types';

const { Title, Text, Paragraph } = Typography;

/**
 * 行程规划结果页面
 * 显示规划完成的行程详情和路线
 */
const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [exportVisible, setExportVisible] = useState(false);
  
  // 从导航状态中获取数据
  const { selectedPOIs = [], planningData = {} } = location.state || {};
  const { totalDays = 1, transportMode = 'walking', startTime = '09:00' } = planningData;

  /**
   * 返回规划页面
   */
  const handleBackToPlan = () => {
    navigate('/plan');
  };

  /**
   * 保存行程
   */
  const handleSaveTrip = () => {
    // TODO: 实现保存功能
    console.log('保存行程:', { selectedPOIs, planningData });
  };

  /**
   * 分享行程
   */
  const handleShareTrip = () => {
    // TODO: 实现分享功能
    console.log('分享行程');
  };

  /**
   * 编辑行程
   */
  const handleEditTrip = () => {
    navigate('/plan', { state: { selectedPOIs, planningData } });
  };

  /**
   * 导出路线详情
   */
  const handleExportRoute = () => {
    setExportVisible(true);
  };

  /**
   * 根据天数分组POI
   */
  const groupPOIsByDays = (pois: POI[], days: number) => {
    const poisPerDay = Math.ceil(pois.length / days);
    const groups = [];
    
    for (let i = 0; i < days; i++) {
      const startIndex = i * poisPerDay;
      const endIndex = Math.min(startIndex + poisPerDay, pois.length);
      groups.push(pois.slice(startIndex, endIndex));
    }
    
    return groups;
  };

  const dailyItinerary = groupPOIsByDays(selectedPOIs, totalDays);

  return (
    <div className="results-page" style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handleBackToPlan}
                  style={{ marginRight: '16px' }}
                >
                  返回规划
                </Button>
                <Title level={2} style={{ display: 'inline', margin: 0 }}>
                  行程规划结果
                </Title>
              </div>
              <div>
                <Button 
                  icon={<EditOutlined />} 
                  onClick={handleEditTrip}
                  style={{ marginRight: '8px' }}
                >
                  编辑行程
                </Button>
                <Button 
                  icon={<ExportOutlined />} 
                  onClick={handleExportRoute}
                  style={{ marginRight: '8px' }}
                >
                  导出详情
                </Button>
                <Button 
                  icon={<ShareAltOutlined />} 
                  onClick={handleShareTrip}
                  style={{ marginRight: '8px' }}
                >
                  分享
                </Button>
                <Button 
                  type="primary"
                  icon={<SaveOutlined />} 
                  onClick={handleSaveTrip}
                >
                  保存行程
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 左侧：行程详情 */}
        <Col xs={24} lg={8}>
          <Card title="行程概览" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>总天数：</Text>
              <Tag color="blue">{totalDays} 天</Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>交通方式：</Text>
              <Tag color="green">
                {transportMode === 'walking' ? '步行' : 
                 transportMode === 'driving' ? '驾车' : 
                 transportMode === 'transit' ? '公共交通' : '骑行'}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>开始时间：</Text>
              <Tag color="orange">{startTime}</Tag>
            </div>
            <div>
              <Text strong>景点总数：</Text>
              <Tag color="purple">{selectedPOIs.length} 个</Tag>
            </div>
          </Card>

          <Card title="每日行程">
            {dailyItinerary.map((dayPOIs, dayIndex) => (
              <div key={dayIndex} style={{ marginBottom: '24px' }}>
                <Title level={4}>第 {dayIndex + 1} 天</Title>
                <Timeline>
                  {dayPOIs.map((poi, poiIndex) => (
                    <Timeline.Item key={poi.id}>
                      <div>
                        <Text strong>{poi.name}</Text>
                        <br />
                        <Text type="secondary">{poi.address}</Text>
                        <br />
                        <Text type="secondary">
                          预计游览时间：{poi.customDuration || poi.suggestedDuration || 60} 分钟
                        </Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
                {dayIndex < dailyItinerary.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        </Col>

        {/* 右侧：地图 */}
        <Col xs={24} lg={16}>
          <Card title="路线地图" bodyStyle={{ padding: 0, height: '600px' }}>
            <MapComponent showRoutes={true} />
          </Card>
        </Col>
      </Row>

      {/* 路线导出组件 */}
      <RouteExport
        visible={exportVisible}
        onClose={() => setExportVisible(false)}
        selectedPOIs={selectedPOIs}
        planningData={planningData}
      />
    </div>
  );
};

export default Results;