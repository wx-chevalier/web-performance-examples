import { List, Collapse, Input, Row, Col, Checkbox, Tabs } from 'antd';
import { Tooltip } from 'antd';
import cn from 'classnames';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Ellipsis from './ellipsis/Ellipsis';

import { actions } from '../ducks/xiddler';

import { getDB } from '../services/xiddler';
import { searchApis, updateApiRecord } from '../services/db';
import { formatDateTime } from '../shared/utils';

import './NetworkPanel.less';

const { Search, TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const prefix = 'app-component-xidder-network-panel';

const InfoItem = ({ label, text }) => (
  <Row gutter={16}>
    <Col span={2} className="label">
      {label}
    </Col>
    <Col span={22}>
      <Ellipsis length={50} tooltip>
        {text}
      </Ellipsis>
    </Col>
  </Row>
);

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

const RespJSONBody = ({ isEdit = false, data = {}, onChange }) => {
  if (!isEdit) {
    return <ReactJson collapsed src={data} />;
  }

  return (
    <ReactJson
      collapsed
      src={data}
      onEdit={({ updated_src: src }) => {
        onChange(src);
      }}
    />
  );
};

RespJSONBody.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  data: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired
};

class NetworkPanel extends PureComponent {
  static propTypes = {
    preference: PropTypes.shape({}).isRequired,
    setApiRecallable: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.loadApis();

    this.interval = setInterval(() => {
      this.loadApis();
    }, 1000);
  }

  componentWillMount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  state = {
    keyword: '',
    apiRecords: [],

    selectedApi: null,

    isPrefixHidden: false
  };

  // 数据库指针
  db = getDB();

  // 定时器句柄
  interval;

  // 存放详情视图的缓存
  infoCache = new Map();

  loadApis() {
    searchApis(this.db).then(apiRecords => {
      this.setState({ apiRecords });
    });
  }

  renderEmpty = () => {
    return (
      <section className={`${prefix}-empty`}>
        <img
          src="https://img.alicdn.com/tfs/TB1JGTEiOrpK1RjSZFhXXXSdXXa-160-160.png"
          alt="placeholder"
        />
        <h3 style={{ marginTop: 16 }}>暂无 API 记录</h3>
      </section>
    );
  };

  renderInfo() {
    const { preference, setApiRecallable } = this.props;
    const { apiRecords, selectedApi } = this.state;
    if (!selectedApi) {
      return (
        <div className={`${prefix}-info-empty`}>
          <h3>选择 API 查看详情</h3>
        </div>
      );
    }

    const apiRecord = apiRecords.filter(_ => _.api === selectedApi)[0];

    const jsonBody = JSON.parse(apiRecord.respBody);

    const isRecallable = preference.recallableApis.indexOf(selectedApi) > -1;

    const bodyArea = (
      <Tabs defaultActiveKey="json" tabPosition="left">
        <TabPane tab="JSON 视图" key="json">
          <RespJSONBody
            isEdit={isRecallable}
            data={jsonBody}
            onChange={data => {
              updateApiRecord(this.db, apiRecord.id, {
                respBody: JSON.stringify(data)
              }).then(() => {
                this.loadApis();
              });
            }}
          />
        </TabPane>
        <TabPane tab="文本视图" key="text">
          <TextArea
            disabled={!isRecallable}
            autosize={{ minRows: 5 }}
            onChange={e => {
              try {
                // 这里进行检查，保证其为有效的 JSON 格式
                JSON.parse(e.target.value);

                updateApiRecord(this.db, apiRecord.id, {
                  respBody: e.target.value
                }).then(() => {
                  this.loadApis();
                });
              } catch (_) {}
            }}
          >
            {apiRecord.respBody}
          </TextArea>
        </TabPane>
      </Tabs>
    );

    return (
      <div className={`${prefix}-info`}>
        <Collapse defaultActiveKey={['general']}>
          <Panel
            header={
              <div className={`${prefix}-info-header`}>
                <div className="title">总览</div>
                <div className="actions">
                  <Tooltip
                    defaultVisible
                    title="勾选回溯，会自动拦截请求，并返回存储的(修改后)结果"
                    overlayStyle={{ zIndex: 99999 }}
                    placement="left"
                  >
                    <Checkbox
                      checked={isRecallable}
                      onClick={e => {
                        setApiRecallable(selectedApi);

                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      Mock API
                    </Checkbox>
                  </Tooltip>
                </div>
              </div>
            }
            key="general"
          >
            <InfoItem label="请求地址" text={apiRecord.api} />
            <InfoItem label="请求时间" text={formatDateTime(apiRecord.timestamp)} />
          </Panel>
          <Panel
            header={
              <div className={`${prefix}-info-header`}>
                <div className="title">响应体</div>
              </div>
            }
            key="respBody"
          >
            {bodyArea}
          </Panel>
        </Collapse>
      </div>
    );
  }

  render() {
    const { apiRecords, keyword, selectedApi, isPrefixHidden } = this.state;

    if (apiRecords.length === 0) {
      return this.renderEmpty();
    }

    const filteredApiRecords = apiRecords.filter(apiRecord => {
      if (!keyword) {
        return true;
      }
      return apiRecord.api && apiRecord.api.indexOf(keyword) > -1;
    });

    return (
      <section className={prefix}>
        <div className="toolbar">
          <Search
            style={{ width: 400 }}
            placeholder="输入 API 前缀检索"
            onSearch={_keyword => {
              this.setState({
                keyword: _keyword
              });
            }}
          />
        </div>
        <div className="content">
          <div className={`${prefix}-list`}>
            <List
              header={
                <div className={`${prefix}-info-header`}>
                  <div className="title">API 列表</div>
                  <div className="actions">
                    <Checkbox
                      checked={isPrefixHidden}
                      onClick={e => {
                        this.setState({
                          isPrefixHidden: !isPrefixHidden
                        });
                      }}
                    >
                      隐藏前缀
                    </Checkbox>
                  </div>
                </div>
              }
              bordered
              dataSource={filteredApiRecords}
              renderItem={record => (
                <List.Item
                  className={cn({
                    'record-item': true,
                    'record-item--selected': record.api === selectedApi
                  })}
                  onClick={() => {
                    this.setState({
                      selectedApi: record.api
                    });
                  }}
                >
                  <Ellipsis length={60} tooltip>
                    {isPrefixHidden ? record.api.replace('mopen.xspace.', '') : record.api}
                  </Ellipsis>
                </List.Item>
              )}
            />
          </div>
          {this.renderInfo()}
        </div>
      </section>
    );
  }
}

export default connect(
  store => ({ ...store.Xiddler }),
  { ...actions }
)(NetworkPanel);
