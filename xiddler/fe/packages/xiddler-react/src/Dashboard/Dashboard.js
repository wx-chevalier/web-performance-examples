import { Tabs, Icon, Tooltip } from 'antd';
import cn from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '../ducks/xiddler';

import NetworkPanel from './NetworkPanel';
import InterceptorConfig from './InterceptorConfig';

import './Dashboard.less';

const { TabPane } = Tabs;

const prefix = 'app-component-xidder-dashboard';

const Dashboard = ({
  isDashboardVisible,
  isIntercepting,
  startIntercepting,
  stopIntercepting,
  toggleDashboard
}) => {
  return (
    <section
      className={cn({
        [prefix]: true,
        [`${prefix}--visible`]: isDashboardVisible
      })}
    >
      <div className={`${prefix}-actions`} style={{ zIndex: '99999' }}>
        {isIntercepting ? (
          <Tooltip
            defaultVisible
            title="点击暂停请求/替换拦截"
            placement="left"
            overlayStyle={{ zIndex: 99999 }}
          >
            <Icon type="pause" theme="outlined" onClick={stopIntercepting} />
          </Tooltip>
        ) : (
          <Tooltip
            defaultVisible
            title="点击开始请求/替换拦截"
            placement="left"
            overlayStyle={{ zIndex: 99999 }}
          >
            <Icon type="caret-right" theme="outlined" onClick={startIntercepting} />
          </Tooltip>
        )}
        <Icon type="cross" theme="outlined" onClick={toggleDashboard} />
      </div>
      <section className={`${prefix}-tabs`}>
        <Tabs defaultActiveKey="network">
          <TabPane tab="网络面板" key="network">
            <NetworkPanel />
          </TabPane>
          <TabPane tab="参数配置" key="config">
            <InterceptorConfig />
          </TabPane>
          <TabPane tab="响应模板" key="boilerplate">
            <InterceptorConfig />
          </TabPane>
        </Tabs>
      </section>
    </section>
  );
};

Dashboard.propTypes = {
  isIntercepting: PropTypes.bool.isRequired,
  isDashboardVisible: PropTypes.bool.isRequired,
  toggleDashboard: PropTypes.func.isRequired,
  startIntercepting: PropTypes.func.isRequired,
  stopIntercepting: PropTypes.func.isRequired
};

export default connect(
  store => ({ ...store.Xiddler }),
  { ...actions }
)(Dashboard);
