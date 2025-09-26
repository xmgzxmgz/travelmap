import React, { useRef } from 'react';
import { Modal, Button, Card, Typography, Table, Divider, Space, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, PictureOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { POI, RouteInfo, TransportMode } from '../types';

const { Title, Text } = Typography;

interface RouteExportProps {
  visible: boolean;
  onClose: () => void;
  selectedPOIs: POI[];
  planningData: any;
  routes?: RouteInfo[];
}

interface RouteSegment {
  from: string;
  to: string;
  transportMode: TransportMode;
  distance: string;
  duration: string;
  cost: number;
  description: string;
}

/**
 * 路线导出组件
 * 提供详细的路线信息导出功能，包含交通方式、费用和路线图
 */
const RouteExport: React.FC<RouteExportProps> = ({
  visible,
  onClose,
  selectedPOIs,
  planningData,
  routes = []
}) => {
  const exportRef = useRef<HTMLDivElement>(null);

  /**
   * 生成路线段数据
   */
  const generateRouteSegments = (): RouteSegment[] => {
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < selectedPOIs.length - 1; i++) {
      const from = selectedPOIs[i];
      const to = selectedPOIs[i + 1];
      const route = routes[i];
      
      // 根据交通方式计算费用
      const calculateCost = (mode: TransportMode, distance: number): number => {
        switch (mode) {
          case TransportMode.WALKING:
          case TransportMode.CYCLING:
            return 0;
          case TransportMode.DRIVING:
            return Math.round(distance * 0.8); // 每公里0.8元油费
          case TransportMode.TRANSIT:
            return Math.round(distance * 0.5 + 2); // 基础票价2元 + 每公里0.5元
          default:
            return 0;
        }
      };

      // 模拟距离和时间（实际应用中应从路线API获取）
      const distance = route?.distance || Math.round(Math.random() * 10 + 1);
      const duration = route?.duration || Math.round(distance * 15 + Math.random() * 30);
      
      // 转换字符串到TransportMode枚举
      const getTransportModeEnum = (mode: string): TransportMode => {
        switch (mode) {
          case 'walking':
            return TransportMode.WALKING;
          case 'driving':
            return TransportMode.DRIVING;
          case 'transit':
            return TransportMode.TRANSIT;
          case 'cycling':
            return TransportMode.CYCLING;
          default:
            return TransportMode.WALKING;
        }
      };
      
      const transportMode = getTransportModeEnum(planningData.transportMode || 'walking');
      const cost = calculateCost(transportMode, distance);

      segments.push({
        from: from.name,
        to: to.name,
        transportMode,
        distance: `${distance} 公里`,
        duration: `${duration} 分钟`,
        cost,
        description: getTransportDescription(transportMode, distance, duration)
      });
    }
    
    return segments;
  };

  /**
   * 获取交通方式描述
   */
  const getTransportDescription = (mode: TransportMode, distance: number, duration: number): string => {
    switch (mode) {
      case TransportMode.WALKING:
        return `步行约${duration}分钟，距离${distance}公里`;
      case TransportMode.CYCLING:
        return `骑行约${duration}分钟，距离${distance}公里`;
      case TransportMode.DRIVING:
        return `驾车约${duration}分钟，距离${distance}公里，建议走主要道路`;
      case TransportMode.TRANSIT:
        return `公共交通约${duration}分钟，可选择地铁、公交等方式`;
      default:
        return `约${duration}分钟，距离${distance}公里`;
    }
  };

  /**
   * 获取交通方式中文名称
   */
  const getTransportModeName = (mode: TransportMode): string => {
    switch (mode) {
      case TransportMode.WALKING:
        return '步行';
      case TransportMode.CYCLING:
        return '骑行';
      case TransportMode.DRIVING:
        return '驾车';
      case TransportMode.TRANSIT:
        return '公共交通';
      default:
        return '未知';
    }
  };

  const routeSegments = generateRouteSegments();
  const totalCost = routeSegments.reduce((sum, segment) => sum + segment.cost, 0);

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: '起点',
      dataIndex: 'from',
      key: 'from',
      width: '15%',
    },
    {
      title: '终点',
      dataIndex: 'to',
      key: 'to',
      width: '15%',
    },
    {
      title: '交通方式',
      dataIndex: 'transportMode',
      key: 'transportMode',
      width: '12%',
      render: (mode: TransportMode) => getTransportModeName(mode),
    },
    {
      title: '距离',
      dataIndex: 'distance',
      key: 'distance',
      width: '10%',
    },
    {
      title: '时间',
      dataIndex: 'duration',
      key: 'duration',
      width: '10%',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: '10%',
      render: (cost: number) => `¥${cost}`,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      width: '28%',
    },
  ];

  /**
   * 导出为PDF
   */
  const exportToPDF = async () => {
    if (!exportRef.current) return;

    try {
      message.loading('正在生成PDF...', 0);
      
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        width: exportRef.current.scrollWidth * 2,
        height: exportRef.current.scrollHeight * 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('旅游路线详情.pdf');
      message.destroy();
      message.success('PDF导出成功！');
    } catch (error) {
      message.destroy();
      message.error('PDF导出失败，请重试');
      console.error('PDF导出错误:', error);
    }
  };

  /**
   * 导出为图片
   */
  const exportToImage = async () => {
    if (!exportRef.current) return;

    try {
      message.loading('正在生成图片...', 0);
      
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        width: exportRef.current.scrollWidth * 2,
        height: exportRef.current.scrollHeight * 2,
      });
      
      const link = document.createElement('a');
      link.download = '旅游路线详情.png';
      link.href = canvas.toDataURL();
      link.click();
      
      message.destroy();
      message.success('图片导出成功！');
    } catch (error) {
      message.destroy();
      message.error('图片导出失败，请重试');
      console.error('图片导出错误:', error);
    }
  };

  /**
   * 打印
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title="路线详情导出"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          关闭
        </Button>,
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          打印
        </Button>,
        <Button key="image" icon={<PictureOutlined />} onClick={exportToImage}>
          导出图片
        </Button>,
        <Button key="pdf" type="primary" icon={<DownloadOutlined />} onClick={exportToPDF}>
          导出PDF
        </Button>,
      ]}
    >
      <div ref={exportRef} style={{ padding: '20px', backgroundColor: 'white' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2}>旅游路线详情</Title>
          <Text type="secondary">生成时间：{new Date().toLocaleString()}</Text>
        </div>

        {/* 行程概览 */}
        <Card title="行程概览" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <Text strong>总天数：</Text>
              <Text>{planningData.totalDays || 1} 天</Text>
            </div>
            <div>
              <Text strong>景点数量：</Text>
              <Text>{selectedPOIs.length} 个</Text>
            </div>
            <div>
              <Text strong>主要交通方式：</Text>
              <Text>{getTransportModeName(planningData.transportMode || 'walking')}</Text>
            </div>
            <div>
              <Text strong>预计总费用：</Text>
              <Text style={{ color: '#f50', fontWeight: 'bold' }}>¥{totalCost}</Text>
            </div>
          </div>
        </Card>

        {/* 景点列表 */}
        <Card title="景点列表" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {selectedPOIs.map((poi, index) => (
              <div key={poi.id} style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    fontSize: '12px'
                  }}>
                    {index + 1}
                  </div>
                  <Text strong>{poi.name}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>{poi.address}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  预计游览：{poi.customDuration || poi.suggestedDuration || 60} 分钟
                </Text>
                {poi.ticketPrice && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      门票：¥{poi.ticketPrice}
                    </Text>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 路线详情表格 */}
        <Card title="路线详情">
          <Table
            columns={columns}
            dataSource={routeSegments.map((segment, index) => ({
              ...segment,
              key: index,
            }))}
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <Text strong>总计</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text strong style={{ color: '#f50' }}>¥{totalCost}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Text type="secondary">不含景点门票</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>

        {/* 注意事项 */}
        <Card title="注意事项" style={{ marginTop: '20px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>以上时间和费用仅供参考，实际情况可能因交通状况、个人游览速度等因素有所差异</li>
            <li>建议提前查看各景点的开放时间和门票信息</li>
            <li>如选择公共交通，建议下载相关APP查看实时班次信息</li>
            <li>建议携带充电宝、雨具等必需品</li>
            <li>请注意安全，遵守各景点的参观规定</li>
          </ul>
        </Card>
      </div>
    </Modal>
  );
};

export default RouteExport;