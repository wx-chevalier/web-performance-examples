import { connect } from 'react-redux';
import { Switch, Tooltip, message } from 'antd';
import cn from 'classnames';
import Draggable from 'react-draggable';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Dashboard from './components/Dashboard';

import { actions } from './ducks/xiddler';

import './style.less';

const prefix = 'app-component-xiddler-portal';

class PortalComponent extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    isIntercepting: PropTypes.bool.isRequired,

    toggleDashboard: PropTypes.func.isRequired
  };

  static defaultProps = {
    className: null
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onHotkeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onHotkeyPress);
  }

  onHotkeyPress = e => {
    if (e.metaKey && e.shiftKey && e.keyCode === 73) {
      this.props.toggleDashboard();
    }
  };

  render() {
    const { isIntercepting, toggleDashboard } = this.props;

    let fab;

    if (!isIntercepting) {
      fab = null;
    } else {
      fab = (
        <Draggable axis="x" bounds="body">
          <div
            className={`${prefix}-container`}
            onClick={() => {
              toggleDashboard();
              message.info(
                '同一 API 仅保留最末次的请求与响应结果；回溯，即中断实际请求而使用保存/篡改值作为返回；',
                10
              );
            }}
          >
            <Tooltip title="点击打开控制台" placement="left" overlayStyle={{ zIndex: 99999 }}>
              <div className="logo" />
            </Tooltip>
          </div>
        </Draggable>
      );
    }

    return (
      <main>
        {fab}
        <Dashboard />
      </main>
    );
  }
}

export default connect(
  store => ({ ...store.Xiddler }),
  { ...actions }
)(PortalComponent);
