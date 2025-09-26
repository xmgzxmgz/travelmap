import React, { useState, useCallback } from 'react';
import { Input, List, Card, Button, Tag, message, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addSelectedPOI, removeSelectedPOI } from '../store/slices/mapSlice';
import { POI } from '../types';

const { Search } = Input;

interface POISearchProps {
  onPOISelect?: (poi: POI) => void;
}

/**
 * POI搜索组件
 * 提供景点搜索、选择和管理功能
 */
const POISearch: React.FC<POISearchProps> = ({ onPOISelect }) => {
  const dispatch = useDispatch();
  const { selectedPOIs } = useSelector((state: RootState) => state.map);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 模拟POI数据库搜索
  const mockPOIDatabase: POI[] = [
    {
      id: 'poi_1',
      name: '故宫博物院',
      coordinates: { lat: 39.9163, lng: 116.3972 },
      address: '北京市东城区景山前街4号',
      category: '博物馆',
      description: '明清两朝的皇家宫殿，现为世界文化遗产',
      suggestedDuration: 180,
      openHours: '08:30-17:00',
      isCustom: false,
    },
    {
      id: 'poi_2',
      name: '天坛公园',
      coordinates: { lat: 39.8828, lng: 116.4067 },
      address: '北京市东城区天坛路甲1号',
      category: '公园',
      description: '明清皇帝祭天的场所',
      suggestedDuration: 120,
      openHours: '06:00-22:00',
      isCustom: false,
    },
    {
      id: 'poi_3',
      name: '颐和园',
      coordinates: { lat: 39.9998, lng: 116.2754 },
      address: '北京市海淀区新建宫门路19号',
      category: '公园',
      description: '中国古典园林之首',
      suggestedDuration: 240,
      openHours: '06:30-18:00',
      isCustom: false,
    },
    {
      id: 'poi_4',
      name: '长城-八达岭段',
      coordinates: { lat: 40.3584, lng: 116.0138 },
      address: '北京市延庆区八达岭镇',
      category: '历史遗迹',
      description: '万里长城最著名的段落',
      suggestedDuration: 300,
      openHours: '07:00-18:00',
      isCustom: false,
    },
    {
      id: 'poi_5',
      name: '南锣鼓巷',
      coordinates: { lat: 39.9368, lng: 116.4034 },
      address: '北京市东城区南锣鼓巷',
      category: '商业街',
      description: '北京最古老的街区之一',
      suggestedDuration: 90,
      openHours: '全天开放',
      isCustom: false,
    },
  ];

  /**
   * 搜索POI
   */
  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setSearchKeyword(keyword);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟搜索逻辑
      const results = mockPOIDatabase.filter(poi =>
        poi.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (poi.address && poi.address.toLowerCase().includes(keyword.toLowerCase())) ||
        (poi.category && poi.category.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      setSearchResults(results);
    } catch (error) {
      message.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 添加POI到愿望清单
   */
  const handleAddPOI = (poi: POI) => {
    const isAlreadySelected = selectedPOIs.some(selected => selected.id === poi.id);
    
    if (isAlreadySelected) {
      message.warning('该景点已在您的愿望清单中');
      return;
    }

    dispatch(addSelectedPOI(poi));
    onPOISelect?.(poi);
    message.success(`已添加 ${poi.name} 到愿望清单`);
  };

  /**
   * 从愿望清单移除POI
   */
  const handleRemovePOI = (poiId: string) => {
    dispatch(removeSelectedPOI(poiId));
    message.success('已从愿望清单移除');
  };

  /**
   * 检查POI是否已选中
   */
  const isPOISelected = (poiId: string) => {
    return selectedPOIs.some(poi => poi.id === poiId);
  };

  /**
   * 获取分类颜色
   */
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '博物馆': 'blue',
      '公园': 'green',
      '历史遗迹': 'orange',
      '商业街': 'purple',
      '餐厅': 'red',
      '酒店': 'cyan',
    };
    return colorMap[category] || 'default';
  };

  return (
    <div className="poi-search">
      <div className="search-header">
        <Search
          placeholder="搜索景点、地址或分类"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {/* 搜索结果 */}
      {searchKeyword && (
        <div className="search-results">
          <h3>搜索结果 ({searchResults.length})</h3>
          <Spin spinning={loading}>
            <List
              dataSource={searchResults}
              renderItem={(poi) => (
                <List.Item>
                  <Card
                    size="small"
                    className="poi-card"
                    actions={[
                      isPOISelected(poi.id) ? (
                        <Button
                          type="text"
                          danger
                          onClick={() => handleRemovePOI(poi.id)}
                        >
                          已添加
                        </Button>
                      ) : (
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddPOI(poi)}
                        >
                          添加
                        </Button>
                      ),
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="poi-title">
                          <span>{poi.name}</span>
                          <Tag color={getCategoryColor(poi.category || '其他')}>
                            {poi.category || '其他'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="poi-description">
                          <div className="poi-address">
                            <EnvironmentOutlined /> {poi.address}
                          </div>
                          <div className="poi-info">
                            {poi.description}
                          </div>
                          <div className="poi-details">
                            <span>建议游玩: {poi.suggestedDuration}分钟</span>
                            {poi.openHours && (
                              <span> | 开放时间: {poi.openHours}</span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        </div>
      )}

      {/* 愿望清单 */}
      <div className="wishlist">
        <h3>愿望清单 ({selectedPOIs.length})</h3>
        <List
          dataSource={selectedPOIs}
          renderItem={(poi) => (
            <List.Item>
              <Card
                size="small"
                className="poi-card selected"
                actions={[
                  <Button
                    type="text"
                    danger
                    onClick={() => handleRemovePOI(poi.id)}
                  >
                    移除
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <div className="poi-title">
                      <span>{poi.name}</span>
                      <Tag color={poi.isCustom ? 'orange' : getCategoryColor(poi.category || '')}>
                        {poi.isCustom ? '自定义' : poi.category}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="poi-description">
                      {poi.address && (
                        <div className="poi-address">
                          <EnvironmentOutlined /> {poi.address}
                        </div>
                      )}
                      <div className="poi-details">
                        <span>
                          游玩时长: {poi.customDuration || poi.suggestedDuration || 60}分钟
                        </span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default POISearch;