import Dexie from 'dexie';

import { logError } from '../shared/logger';

/** 初始化数据库 */
export function initDB() {
  const db = new Dexie('Xiddler');

  db.version(1).stores({
    apis:
      '++id, uuid, timestamp, url, method, &api, version, reqParams, statusCode, respHeaders, respBody' //
  });

  db.open().catch((err) => {
    logError(err.stack || err);
  });

  return db;
}

/** 插入或者更新记录 */
export function insertOrUpdateApiRecord(db, api, apiRecord) {
  return db
    .transaction('rw', db.apis, () => {
      db.apis.add(apiRecord).catch(() => {
        selectApiDetail(db, api).then(({ id }) => {
          // 出现错误则先查出，后更新
          db.apis.update(id, apiRecord);
        });
      });
    })
    .catch((e) => {
      logError(e.stack);
    });
}

/** 更新记录 */
export function updateApiRecord(db, key, apiRecord) {
  return db.apis.update(key, apiRecord).catch((e) => {
    logError(e.stack);
  });
}

/** 根据前缀查询 API */
export function searchApis(db, prefix = 'mopen') {
  return db.apis
    .where('api')
    .startsWith(prefix)
    .toArray();
}

/** 查询某个 API 的详细信息 */
export function selectApiDetail(db, api) {
  return db.apis
    .where('api')
    .equals(api)
    .first();
}
