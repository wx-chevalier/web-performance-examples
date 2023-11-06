/** 数据模型操作 */
import uuidv4 from 'uuid/v4';

/** 从 Polly 截获的请求中生成 API 记录 */
export function generateApiRecord(api, req, res) {
  const apiRecord = {
    uuid: uuidv4(),
    timestamp: res.timestamp,
    url: req.identifiers.url,
    method: req.identifiers.method,

    api,
    version: '0.1',

    statusCode: res.statusCode,
    respHeaders: { ...res.headers },
    respBody: res.body
  };

  return apiRecord;
}

/** 判断是否某个 Api 受控 */
export function isApiControlled(api) {
  const {
    offlineApis,
    recallableApis,
    degradedApis
  } = window.xiddler.preference;

  return [...offlineApis, ...recallableApis, ...degradedApis].indexOf(api) > -1;
}
