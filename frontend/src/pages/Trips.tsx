import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  List,
  Tag,
  Empty,
  Space,
  message,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTrips, createTrip, deleteTripAsync } from '../store/slices/tripSlice';

const { Title, Text } = Typography;

/**
 * 行程管理页面组件
 */
const Trips: React.FC = () => {
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

  const handleCreateTrip = async () => {
    try {
      const result = await dispatch(createTrip({
        name: `新行程 ${new Date().toLocaleDateString()}`
      }));
      
      if (createTrip.fulfilled.match(result)) {
        message.success('创建行程成功！');
        navigate('/plan');
      }
    } catch (error) {
      message.error('创建行程失败');
    }
  };

  const handleEditTrip = (tripId: string) => {
    navigate(`/plan?edit=${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const result = await dispatch(deleteTripAsync(tripId));
      if (deleteTripAsync.fulfilled.match(result)) {
        message.success('删除行程成功！');
      }
    } catch (error) {
      message.error('删除行程失败');
    }
  };

  const handleShareTrip = (tripId: string) => {
    // TODO: 实现分享功能
    message.info('分享功能即将上线');
  };



  return (
    <div className="trips-page">
      <div className="trips-header">
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
          <Card>
            <Empty
              description="您还没有创建任何行程"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleCreateTrip}>
                创建第一个行程
              </Button>
            </Empty>
          </Card>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={trips}
            renderItem={(trip: any) => (
              <List.Item>
                <Card
                  title={trip.name}
                  extra={
                    <Tag color="blue">
                      行程
                    </Tag>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditTrip(trip.id)}
                    >
                      编辑
                    </Button>,
                    <Button
                      type="text"
                      icon={<ShareAltOutlined />}
                      onClick={() => handleShareTrip(trip.id)}
                    >
                      分享
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <div className="trip-info">
                    <Space direction="vertical" size="small">
                      <Text>总天数: {trip.totalDays || 0} 天</Text>
                      <Text>景点数量: {trip.dailyItineraries?.length || 0} 个</Text>
                      <Text type="secondary">创建时间: {new Date(trip.createdAt).toLocaleDateString()}</Text>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  );
};

export default Trips;