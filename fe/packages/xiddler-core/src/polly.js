/** 请求拦截器模块 */
import { Polly } from '@pollyjs/core';
import XHRAdapter from '@pollyjs/adapter-xhr';
import FetchAdapter from '@pollyjs/adapter-fetch';
import WormholePersister from './WormholePersister';

import { logDebug } from '../shared/logger';
import { generateApiRecord, isApiControlled } from './model';
import { getDB, getIsIntercepting } from './xiddler';
import { insertOrUpdateApiRecord, selectApiDetail } from './db';

Polly.register(XHRAdapter);
Polly.register(FetchAdapter);
Polly.register(WormholePersister);

/** 初始化 Polly */
export function initPolly(host) {
  const polly = new Polly('XSpace', {
    adapters: ['xhr', 'fetch'],
    persister: 'wormhole-storage'
  });

  const { server } = polly;

  server.host(host, () => {
    attachInterceptor(server.get('/h5/:api/1.0'));
    attachInterceptor(server.post('/h5/:api/1.0'));
  });

  return polly;
}

/** 附着监听器 */
function attachInterceptor(serverInstance) {
  serverInstance
    .on('request', (req) => {
      const api = req.params.api;
      logDebug(api, req);
    })
    .intercept((req, res, interceptor) => {
      return new Promise((resolve) => {
        const api = req.params.api;

        const {
          offlineApis,
          recallableApis,
          degradedApis
        } = window.xiddler.preference;

        // 判断是否需要离线
        if (offlineApis.indexOf(api) > -1) {
          res.sendStatus(500);

          resolve();
        } else if (degradedApis.indexOf(api) > -1) {
          // 判断是否需要降级
          res.json({ success: true, data: [], payload: [] });

          resolve();
        } else if (recallableApis.indexOf(api) > -1) {
          // 判断是否需要回溯
          selectApiDetail(getDB(), api).then((record) => {
            if (record.statusCode !== 200) {
              res.sendStatus(record.statusCode);
            } else {
              res.json(JSON.parse(record.respBody));
            }

            resolve();
          });
        } else {
          interceptor.passthrough();
          resolve();
        }
      }).catch((e) => {
        // logError(e)
      });
    })
    .on('beforeResponse', (req, res) => {
      if (!getIsIntercepting()) {
        return;
      }

      const api = req.params.api;
      const apiRecord = generateApiRecord(api, req, res);

      // 这里仅记录不需要离线、降级、回溯的接口
      if (!isApiControlled(api)) {
        insertOrUpdateApiRecord(getDB(), api, apiRecord);

        logDebug(apiRecord);
      }
    });
}
