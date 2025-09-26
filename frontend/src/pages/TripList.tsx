import React, { useEffect } from 'react';
import { Card, List, Button, Typography, message, Spin, Empty } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTrips, createTrip } from '../store/slices/tripSlice';
import { RootState, AppDispatch } from '../store';

const { Title, Text } = Typography;

/**
 * 行程列表页面组件
 */
const TripList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // 获取行程状态
  const tripState = useSelector((state: RootState) => state.trip) as any;
  const { trips = [], loading = false, error } = tripState;

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  /**
   * 创建新行程
   */
  const handleCreateTrip = async () => {
    try {
      const result = await dispatch(createTrip({
        name: `新行程 ${new Date().toLocaleDateString()}`
      }));
      
      if (createTrip.fulfilled.match(result)) {
        message.success('创建行程成功！');
      }
    } catch (error) {
      message.error('创建行程失败');
    }
  };

  /**
   * 查看行程详情
   */
  const handleViewTrip = (trip: any) => {
    navigate(`/trip/${trip.id}`);
  };



  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>我的行程</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateTrip}
          loading={loading}
        >
          创建新行程
        </Button>
      </div>

      <Spin spinning={loading}>
        {trips.length === 0 ? (
          <Empty
            description="暂无行程"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTrip}>
              创建第一个行程
            </Button>
          </Empty>
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            dataSource={trips}
            renderItem={(trip: any) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button type="link" onClick={() => handleViewTrip(trip)}>
                      查看详情
                    </Button>,
                  ]}
                  onClick={() => handleViewTrip(trip)}
                >
                  <Card.Meta
                    title={trip.name}
                    description={
                      <div>
                        <Text type="secondary">{trip.description || '暂无描述'}</Text>
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <CalendarOutlined style={{ marginRight: '4px' }} />
                            <Text type="secondary">
                              创建时间: {new Date(trip.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  );
};

export default TripList;