import { message, Tooltip } from 'antd';
import cn from 'classnames';
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import { getAccount, findUserServicerList } from '../api';
import { actions } from '../ducks/xiddler';
import { formatTime } from '../shared/utils';
import { isDebug } from '../shared/logger';

import './Toolbar.less';

const prefix = 'app-component-xidder-toolbar';

class Toolbar extends PureComponent {
  static propTypes = {
    isIntercepting: PropTypes.bool.isRequired,
    startInterceptingMoment: PropTypes.number.isRequired,

    toggleDashboard: PropTypes.func.isRequired,
    startIntercepting: PropTypes.func.isRequired,
    stopIntercepting: PropTypes.func.isRequired
  };

  componentDidMount() {}

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  state = {
    currentTime: +moment()
  };

  interval = null;

  handleToggleIntercept = () => {
    const { isIntercepting, startIntercepting, stopIntercepting } = this.props;

    // 如果正在录制，则停止
    if (isIntercepting) {
      stopIntercepting();
    } else {
      startIntercepting();

      message.info('Xiddler 开始监听所有 API 请求...');

      if (isDebug) {
        // 测试代码
        getAccount();
        findUserServicerList();
      }

      this.interval = setInterval(() => {
        this.setState({
          currentTime: +moment()
        });
      }, 100);
    }
  };

  renderInfo() {
    const { isIntercepting, startInterceptingMoment, toggleDashboard } = this.props;
    const { currentTime } = this.state;

    const tip = (
      <div style={{ color: '#2FA6EB' }}>
        <span onClick={toggleDashboard}>点击打开控制台</span>
      </div>
    );

    if (!isIntercepting) {
      return (
        <div>
          <div style={{ fontSize: 14 }}>Xiddler, API 拦截·回溯/重放·篡改·降级</div>
          {tip}
        </div>
      );
    }

    let duration = currentTime - startInterceptingMoment;
    if (duration < 0) {
      duration = 0;
    }

    return (
      <div>
        <div style={{ fontSize: 14 }}>Xiddler 正在监听所有 API 请求</div>
        <div style={{ display: 'flex' }}>
          {tip}
          <span style={{ marginLeft: 8 }}>{formatTime(duration)}</span>
        </div>
      </div>
    );
  }

  render() {
    const { isIntercepting } = this.props;

    return (
      <div className={prefix}>
        <Tooltip title={isIntercepting ? '点击停止请求录制' : '点击开始请求录制'} placement="left">
          <div
            className={cn('record-button', {
              recording: isIntercepting
            })}
            onClick={this.handleToggleIntercept}
          />
        </Tooltip>
        <span>{this.renderInfo()}</span>
      </div>
    );
  }
}

export default connect(
  store => ({ ...store.Xiddler }),
  { ...actions }
)(Toolbar);
