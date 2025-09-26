import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card, 
  Button, 
  Form, 
  DatePicker, 
  Select, 
  InputNumber, 
  Space, 
  Row, 
  Col, 
  Typography, 
  Progress,
  message,
  Tabs,
  Switch
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, CarOutlined, GroupOutlined } from '@ant-design/icons';
import MapComponent from '../components/MapComponent';
import POISearch from '../components/POISearch';
import CityPOISelector from '../components/CityPOISelector';
import { RootState } from '../store';
import { startPlanning, updatePlanningProgress } from '../store/slices/tripSlice';
import { POI, TransportMode } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 行程规划页面
 * 提供地图选点、POI搜索、行程参数设置等功能
 */
const Plan: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Redux状态
  const { selectedPOIs } = useSelector((state: RootState) => state.map);
  const tripState = useSelector((state: RootState) => state.trip) as any;
  const { planningData, isPlanning, planningProgress } = tripState;
  
  // 本地状态
  const [showResults, setShowResults] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [routePlanningMode, setRoutePlanningMode] = useState(false);

  // 处理POI点击
  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (routePlanningMode) {
      // 路线规划模式 - 需要出发地和目的地
      message.info('路线规划功能开发中...');
      return;
    }

    if (selectedPOIs.length === 0) {
      message.warning('请至少选择一个景点');
      return;
    }

    try {
      const planRequest = {
        pois: selectedPOIs,
        startDate: values.startDate.format('YYYY-MM-DD'),
        days: values.days,
        transportMode: values.transportMode,
        startTime: values.startTime,
        budget: values.budget,
      };

      dispatch(startPlanning());
      setShowResults(true);
      
      // 延迟跳转到结果页面
      setTimeout(() => {
        navigate('/results', { 
          state: { 
            selectedPOIs, 
            planningData,
            planRequest 
          } 
        });
      }, 1500);
    } catch (error) {
      message.error('规划失败，请重试');
    }
  };

  // 清除规划数据
  const handleClearPlanning = () => {
    setShowResults(false);
    setSelectedPOI(null);
  };

  // 切换规划模式
  const handleModeChange = (checked: boolean) => {
    setRoutePlanningMode(checked);
    handleClearPlanning();
  };

  return (
    <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
        <GroupOutlined /> 智能行程规划
      </Title>
      
      <Row gutter={24} style={{ flex: 1, height: 'calc(100vh - 120px)' }}>
        {/* 左侧控制面板 */}
        <Col span={8} style={{ height: '100%', overflowY: 'auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* 规划模式切换 */}
            <Card title="规划模式" size="small">
              <Space align="center">
                <Text>景点规划</Text>
                <Switch 
                  checked={routePlanningMode}
                  onChange={handleModeChange}
                />
                <Text>路线规划</Text>
              </Space>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                {routePlanningMode ? '选择出发地和目的地生成路线' : '选择多个景点生成行程'}
              </div>
            </Card>

            {/* 规划参数设置 */}
            <Card title="规划参数" size="small">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  days: 3,
                  transportMode: 'walking',
                  startTime: '09:00',
                  budget: 1000,
                  startDate: dayjs().add(1, 'day'),
                }}
              >
                <Form.Item
                  name="startDate"
                  label="出发日期"
                  rules={[{ required: true, message: '请选择出发日期' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>

                {!routePlanningMode && (
                  <Form.Item
                    name="days"
                    label="行程天数"
                    rules={[{ required: true, message: '请输入行程天数' }]}
                  >
                    <InputNumber
                      min={1}
                      max={30}
                      style={{ width: '100%' }}
                      addonAfter="天"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="transportMode"
                  label="主要交通方式"
                  rules={[{ required: true, message: '请选择交通方式' }]}
                >
                  <Select>
                    <Option value="walking">步行</Option>
                    <Option value="driving">自驾</Option>
                    <Option value="transit">公共交通</Option>
                    <Option value="cycling">骑行</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="startTime"
                  label="每日开始时间"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <Select>
                    <Option value="08:00">08:00</Option>
                    <Option value="09:00">09:00</Option>
                    <Option value="10:00">10:00</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="budget"
                  label="预算 (元)"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="可选"
                  />
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: '100%' }}>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={isPlanning}
                      disabled={routePlanningMode ? false : selectedPOIs.length === 0}
                      icon={<GroupOutlined />}
                    >
                      {routePlanningMode ? '生成路线' : '开始规划'}
                    </Button>
                    <Button onClick={handleClearPlanning}>
                      清除
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>

            {/* 规划进度 */}
            {isPlanning && (
              <Card title="规划进度" size="small">
                <Progress 
                  percent={planningProgress || 0} 
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  正在为您规划最佳行程...
                </Text>
              </Card>
            )}

            {/* POI搜索和城市选择 - 仅在景点规划模式显示 */}
            {!routePlanningMode && (
              <Card title="景点选择" size="small">
                <Tabs defaultActiveKey="search" size="small">
                  <TabPane tab="搜索景点" key="search">
                    <POISearch onPOISelect={handlePOIClick} />
                  </TabPane>
                  <TabPane tab="按城市选择" key="city">
                    <CityPOISelector onPOISelect={handlePOIClick} />
                  </TabPane>
                </Tabs>
              </Card>
            )}

            {/* 已选景点列表 - 仅在景点规划模式显示 */}
            {!routePlanningMode && selectedPOIs.length > 0 && (
              <Card title={`已选景点 (${selectedPOIs.length})`} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedPOIs.map((poi, index) => (
                    <div key={poi.id} style={{ 
                      padding: '8px', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '4px',
                      backgroundColor: selectedPOI?.id === poi.id ? '#e6f7ff' : 'transparent'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{index + 1}. {poi.name}</div>
                      {poi.address && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{poi.address}</div>
                      )}
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        <ClockCircleOutlined /> {poi.customDuration || poi.suggestedDuration || 60} 分钟
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {/* 规划结果预览 */}
            {showResults && planningData && (
              <Card title="规划结果" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>总天数：</Text>
                    <Text>{planningData.totalDays} 天</Text>
                  </div>
                  <div>
                    <Text strong>交通方式：</Text>
                    <Text>{planningData.transportMode}</Text>
                  </div>
                  <div>
                    <Text strong>开始时间：</Text>
                    <Text>{planningData.startTime}</Text>
                  </div>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/results', { 
                      state: { 
                        selectedPOIs, 
                        planningData 
                      } 
                    })}
                  >
                    查看详细结果 →
                  </Button>
                </Space>
              </Card>
            )}
          </Space>
        </Col>

        {/* 右侧地图 */}
        <Col span={16} style={{ height: '100%' }}>
          <Card 
            title={routePlanningMode ? "选择出发地和目的地" : "地图选点"} 
            style={{ height: '100%' }}
            bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
          >
            <MapComponent 
              onPOIClick={handlePOIClick}
              showRoutes={showResults}
              showHotspots={true}
              originDestinationMode={routePlanningMode}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Plan;