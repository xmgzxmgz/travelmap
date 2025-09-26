import React, { useState, useCallback } from 'react';
import { Input, List, Card, Button, Tag, message, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addSelectedPOI, removeSelectedPOI } from '../store/slices/mapSlice';
import { POI } from '../types';
import { getAllPOIs, searchPOIs } from '../data/hotspots';

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

  // 使用系统景点数据库（包含热门景点和扩展景点），禁止自定义景点
  const systemPOIDatabase: POI[] = getAllPOIs();

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
      
      // 使用专门的搜索函数搜索景点
      const results = searchPOIs(keyword);
      
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