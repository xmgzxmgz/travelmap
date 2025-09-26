import React, { useState, useEffect } from 'react';
import { Card, Select, List, Button, Tag, message, Row, Col, Statistic } from 'antd';
import { EnvironmentOutlined, StarOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addSelectedPOI } from '../store/slices/mapSlice';
import { POI } from '../types';
import { getAllPOIsByCity, getAllCities, getPOIsByCategory, getAllCategories } from '../data/hotspots';

const { Option } = Select;

interface CityPOISelectorProps {
  onPOISelect?: (poi: POI) => void;
}

/**
 * 城市景点选择器组件
 * 按城市和类别展示景点，方便用户选择
 */
const CityPOISelector: React.FC<CityPOISelectorProps> = ({ onPOISelect }) => {
  const dispatch = useDispatch();
  const { selectedPOIs } = useSelector((state: RootState) => state.map);
  const [selectedCity, setSelectedCity] = useState<string>('北京');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [cityPOIs, setCityPOIs] = useState<POI[]>([]);
  const [filteredPOIs, setFilteredPOIs] = useState<POI[]>([]);
  const [cities] = useState<string[]>(getAllCities());
  const [categories] = useState<string[]>(['全部', ...getAllCategories()]);

  // 加载选中城市的景点
  useEffect(() => {
    const pois = getAllPOIsByCity(selectedCity);
    setCityPOIs(pois);
  }, [selectedCity]);

  // 根据类别过滤景点
  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredPOIs(cityPOIs);
    } else {
      const filtered = cityPOIs.filter(poi => poi.category === selectedCategory);
      setFilteredPOIs(filtered);
    }
  }, [cityPOIs, selectedCategory]);

  /**
   * 处理景点选择
   */
  const handlePOISelect = (poi: POI) => {
    // 检查是否已经选择
    const isSelected = selectedPOIs.some(selected => selected.id === poi.id);
    if (isSelected) {
      message.warning(`${poi.name} 已在行程中`);
      return;
    }

    dispatch(addSelectedPOI(poi));
    onPOISelect?.(poi);
    message.success(`已添加 ${poi.name} 到行程`);
  };

  /**
   * 获取景点评级颜色
   */
  const getRatingColor = (rating?: number): string => {
    if (!rating) return '#d9d9d9';
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#faad14';
    if (rating >= 3.5) return '#fa8c16';
    return '#f5222d';
  };

  /**
   * 获取热度排名标签
   */
  const getHotRankTag = (hotRank?: number) => {
    if (!hotRank) return null;
    if (hotRank <= 10) return <Tag color="red">TOP {hotRank}</Tag>;
    if (hotRank <= 30) return <Tag color="orange">热门</Tag>;
    return <Tag color="blue">推荐</Tag>;
  };

  return (
    <Card 
      title="城市景点选择器" 
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InfoCircleOutlined />
          <span style={{ fontSize: '12px', color: '#666' }}>
            已选择 {selectedPOIs.length} 个景点
          </span>
        </div>
      }
    >
      {/* 城市和类别选择器 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="选择城市"
            value={selectedCity}
            onChange={setSelectedCity}
          >
            {cities.map(city => (
              <Option key={city} value={city}>{city}</Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="选择类别"
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Statistic 
            title="景点总数" 
            value={cityPOIs.length} 
            prefix={<EnvironmentOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="当前显示" 
            value={filteredPOIs.length} 
            prefix={<StarOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="平均评分" 
            value={filteredPOIs.length > 0 ? 
              (filteredPOIs.reduce((sum, poi) => sum + (poi.rating || 0), 0) / filteredPOIs.length).toFixed(1) : 
              '0.0'
            } 
            suffix="分"
          />
        </Col>
      </Row>

      {/* 景点列表 */}
      <List
        dataSource={filteredPOIs}
        renderItem={(poi) => {
          const isSelected = selectedPOIs.some(selected => selected.id === poi.id);
          
          return (
            <List.Item
              actions={[
                <Button
                  key="add"
                  type={isSelected ? "default" : "primary"}
                  size="small"
                  icon={<PlusOutlined />}
                  disabled={isSelected}
                  onClick={() => handlePOISelect(poi)}
                >
                  {isSelected ? '已添加' : '添加'}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{poi.name}</span>
                    {getHotRankTag(poi.hotRank)}
                    {poi.category && <Tag color="blue">{poi.category}</Tag>}
                    {poi.rating && (
                      <Tag color={getRatingColor(poi.rating)}>
                        ⭐ {poi.rating}
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    {poi.address && (
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        <EnvironmentOutlined /> {poi.address}
                      </div>
                    )}
                    {poi.description && (
                      <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                        {poi.description}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {poi.suggestedDuration && `建议游览时间: ${poi.suggestedDuration}分钟`}
                      {poi.ticketPrice !== undefined && (
                        <span style={{ marginLeft: '12px' }}>
                          门票: {poi.ticketPrice === 0 ? '免费' : `¥${poi.ticketPrice}`}
                        </span>
                      )}
                      {poi.openHours && (
                        <span style={{ marginLeft: '12px' }}>
                          开放时间: {poi.openHours}
                        </span>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default CityPOISelector;