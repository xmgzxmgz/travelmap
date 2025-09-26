import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';
import { RootState } from '../store';
import { setMapView, addCustomPOI, addSelectedPOI, removeSelectedPOI } from '../store/slices/mapSlice';
import { POI, Coordinates } from '../types';
import { hotspotPOIs, getHotspotsByRank } from '../data/hotspots';
import { Button, Tag, message } from 'antd';
import { EnvironmentOutlined, StarOutlined, DollarOutlined } from '@ant-design/icons';

// 修复Leaflet默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  onPOIClick?: (poi: POI) => void;
  showRoutes?: boolean;
  showHotspots?: boolean;
  originDestinationMode?: boolean;
}

/**
 * 地图点击事件处理组件
 */
const MapClickHandler: React.FC<{ onMapClick: (coords: Coordinates) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

/**
 * 主地图组件
 * 使用Leaflet实现地图显示、POI标记、路线显示等功能
 */
const MapComponent: React.FC<MapComponentProps> = ({ 
  onPOIClick, 
  showRoutes = false, 
  showHotspots = true,
  originDestinationMode = false 
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<L.Map | null>(null);
  const { center, zoom, selectedPOIs, currentTrip } = useSelector((state: RootState) => state.map);
  const [hotspots, setHotspots] = useState<POI[]>([]);
  const [origin, setOrigin] = useState<POI | null>(null);
  const [destination, setDestination] = useState<POI | null>(null);

  // 加载热门景点数据
  useEffect(() => {
    if (showHotspots) {
      const topHotspots = getHotspotsByRank(50);
      setHotspots(topHotspots);
    }
  }, [showHotspots]);

  // 处理地图点击事件，添加自定义POI
  const handleMapClick = (coords: Coordinates) => {
    const customPOI: POI = {
      id: `custom_${Date.now()}`,
      name: '自定义地点',
      coordinates: coords,
      isCustom: true,
      customDuration: 60, // 默认1小时
    };
    
    dispatch(addCustomPOI(customPOI));
  };

  // 处理热门景点点击
  const handleHotspotClick = (poi: POI) => {
    if (originDestinationMode) {
      if (!origin) {
        setOrigin({ ...poi, isOrigin: true });
        message.success(`已设置 ${poi.name} 为出发地`);
      } else if (!destination && poi.id !== origin.id) {
        setDestination({ ...poi, isDestination: true });
        message.success(`已设置 ${poi.name} 为目的地`);
      } else {
        message.warning('请先清除当前选择再重新设置');
      }
    } else {
      dispatch(addSelectedPOI(poi));
      onPOIClick?.(poi);
      message.success(`已添加 ${poi.name} 到行程`);
    }
  };

  // 清除出发地和目的地选择
  const clearOriginDestination = () => {
    setOrigin(null);
    setDestination(null);
    message.info('已清除出发地和目的地选择');
  };

  // 处理地图视图变化
  const handleMapMove = () => {
    if (mapRef.current) {
      const map = mapRef.current;
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      
      dispatch(setMapView({
        center: { lat: newCenter.lat, lng: newCenter.lng },
        zoom: newZoom,
      }));
    }
  };

  // 创建自定义图标
  const createCustomIcon = (color: string, isSelected: boolean = false, iconType: 'normal' | 'origin' | 'destination' | 'hotspot' = 'normal') => {
    let iconHtml = '';
    
    switch (iconType) {
      case 'origin':
        iconHtml = `<div style="
          background-color: #52c41a;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">起</div>`;
        break;
      case 'destination':
        iconHtml = `<div style="
          background-color: #f5222d;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">终</div>`;
        break;
      case 'hotspot':
        iconHtml = `<div style="
          background-color: ${color};
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #ff4d4f;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          ">${(hotspots.find(h => h.coordinates.lat === parseFloat(iconHtml.match(/lat: ([\d.]+)/)?.[1] || '0'))?.hotRank || '').toString().slice(0, 2)}</div>
        </div>`;
        break;
      default:
        iconHtml = `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid ${isSelected ? '#52c41a' : '#fff'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`;
    }

    return L.divIcon({
      className: 'custom-marker',
      html: iconHtml,
      iconSize: iconType === 'origin' || iconType === 'destination' ? [24, 24] : [20, 20],
      iconAnchor: iconType === 'origin' || iconType === 'destination' ? [12, 12] : [10, 10],
    });
  };

  // 渲染路线
  const renderRoutes = () => {
    if (!showRoutes || !currentTrip) return null;

    return currentTrip.dailyItineraries.map((day, dayIndex) => {
      const dayColor = `hsl(${dayIndex * 60}, 70%, 50%)`;
      
      return day.routes.map((route, routeIndex) => {
        // 如果有途经点数据，绘制详细路线
        if (route.waypoints && route.waypoints.length > 0) {
          const positions: [number, number][] = route.waypoints.map(point => [point.lat, point.lng]);
          
          return (
            <Polyline
              key={`route-${dayIndex}-${routeIndex}`}
              positions={positions}
              color={dayColor}
              weight={4}
              opacity={0.8}
            />
          );
        }
        
        // 如果没有途经点，绘制直线
        const fromPOI = day.pois.find(poi => poi.id === route.from);
        const toPOI = day.pois.find(poi => poi.id === route.to);
        
        if (fromPOI && toPOI) {
          return (
            <Polyline
              key={`route-${dayIndex}-${routeIndex}`}
              positions={[
                [fromPOI.coordinates.lat, fromPOI.coordinates.lng],
                [toPOI.coordinates.lat, toPOI.coordinates.lng]
              ]}
              color={dayColor}
              weight={3}
              opacity={0.6}
              dashArray="5, 10"
            />
          );
        }
        
        return null;
      });
    });
  };

  // 渲染出发地到目的地的路线预览
  const renderOriginDestinationRoute = () => {
    if (!origin || !destination) return null;
    
    return (
      <Polyline
        positions={[
          [origin.coordinates.lat, origin.coordinates.lng],
          [destination.coordinates.lat, destination.coordinates.lng]
        ]}
        color="#1890ff"
        weight={3}
        opacity={0.7}
        dashArray="10, 5"
      />
    );
  };

  return (
    <div className="map-container" style={{ position: 'relative', height: '100%' }}>
      {/* 出发地目的地模式控制面板 */}
      {originDestinationMode && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>路线规划</div>
          <div style={{ marginBottom: '4px' }}>
            出发地: {origin ? origin.name : '请在地图上选择'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            目的地: {destination ? destination.name : '请在地图上选择'}
          </div>
          <Button size="small" onClick={clearOriginDestination}>
            清除选择
          </Button>
        </div>
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenReady={() => {
          // 地图准备就绪后的回调
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 地图点击事件处理 */}
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* 渲染热门景点 */}
        {showHotspots && hotspots.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.coordinates.lat, poi.coordinates.lng]}
            icon={createCustomIcon('#fa8c16', false, 'hotspot')}
            eventHandlers={{
              click: () => handleHotspotClick(poi),
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <StarOutlined style={{ color: '#faad14' }} />
                  {poi.name}
                  <Tag color="red">#{poi.hotRank}</Tag>
                </h4>
                {poi.address && <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>{poi.address}</p>}
                {poi.description && <p style={{ margin: '4px 0', fontSize: '13px' }}>{poi.description}</p>}
                <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {poi.category && <Tag color="blue">{poi.category}</Tag>}
                  {poi.rating && <Tag color="orange">⭐ {poi.rating}</Tag>}
                  {poi.ticketPrice !== undefined && (
                    <Tag color={poi.ticketPrice === 0 ? 'green' : 'purple'}>
                      <DollarOutlined /> {poi.ticketPrice === 0 ? '免费' : `¥${poi.ticketPrice}`}
                    </Tag>
                  )}
                </div>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  游玩时长: {poi.customDuration || poi.suggestedDuration || 60} 分钟
                </p>
                {poi.openHours && <p style={{ margin: '4px 0', fontSize: '12px' }}>开放时间: {poi.openHours}</p>}
                <Button 
                  type="primary" 
                  size="small" 
                  style={{ marginTop: '8px' }}
                  onClick={() => handleHotspotClick(poi)}
                >
                  {originDestinationMode ? '选择此地点' : '添加到行程'}
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 渲染出发地 */}
        {origin && (
          <Marker
            key={`origin-${origin.id}`}
            position={[origin.coordinates.lat, origin.coordinates.lng]}
            icon={createCustomIcon('#52c41a', true, 'origin')}
          >
            <Popup>
              <div>
                <h4>🚩 出发地</h4>
                <p>{origin.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 渲染目的地 */}
        {destination && (
          <Marker
            key={`destination-${destination.id}`}
            position={[destination.coordinates.lat, destination.coordinates.lng]}
            icon={createCustomIcon('#f5222d', true, 'destination')}
          >
            <Popup>
              <div>
                <h4>🏁 目的地</h4>
                <p>{destination.name}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* 渲染选中的POI */}
        {selectedPOIs.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.coordinates.lat, poi.coordinates.lng]}
            icon={createCustomIcon(
              poi.isCustom ? '#fa8c16' : '#1890ff',
              true
            )}
            eventHandlers={{
              click: () => onPOIClick?.(poi),
            }}
          >
            <Popup>
              <div>
                <h4>{poi.name}</h4>
                {poi.address && <p>{poi.address}</p>}
                {poi.description && <p>{poi.description}</p>}
                <p>游玩时长: {poi.customDuration || poi.suggestedDuration || 60} 分钟</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* 渲染路线 */}
        {renderRoutes()}
        
        {/* 渲染出发地到目的地的路线预览 */}
        {renderOriginDestinationRoute()}
      </MapContainer>
    </div>
  );
};

export default MapComponent;