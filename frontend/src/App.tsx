import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Trips from './pages/Trips';
import Results from './pages/Results';
import './App.css';

/**
 * 主应用组件
 * 配置路由、状态管理和国际化
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="plan" element={<Plan />} />
                <Route path="trips" element={<Trips />} />
                <Route path="results" element={<Results />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;