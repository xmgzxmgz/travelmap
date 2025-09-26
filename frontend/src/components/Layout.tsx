import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

const { Header, Content } = AntLayout;

/**
 * 应用主布局组件
 * 包含顶部导航栏和内容区域
 */
const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 主导航菜单
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/plan',
      icon: <PlusOutlined />,
      label: '规划行程',
    },
    {
      key: '/trips',
      icon: <UnorderedListOutlined />,
      label: '我的行程',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1890ff',
                marginRight: '32px',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              智能旅行规划师
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ border: 'none', background: 'transparent' }}
            />
          </div>
          
          <div>
            {/* 移除了用户认证相关的UI */}
          </div>
        </div>
      </Header>
      
      <Content>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;