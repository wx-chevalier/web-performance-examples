/* eslint function-paren-newline: 0 */
/** Xiddler 核心模块 */
import { initDB } from './db';
import { initPolly } from './polly';
import { logError } from '../shared/logger';

const XFIDDLER_PREFERENCE = 'XFIDDLER_PREFERENCE';

// 判断当前域名
const { hostname } = window.location;

const HOST = hostname.indexOf('pre' > -1)
  ? 'https://pre-api-xspace.taobao.com'
  : 'https://api-xspace.taobao.com';

/** 开始监听 */
export function startIntercepting() {
  ensureXiddlerConfig();

  window.xiddler.isIntercepting = true;
  window.xiddler.polly = initPolly(HOST);

  return window.xiddler.isIntercepting;
}

/** 停止监听 */
export function stopIntercepting() {
  ensureXiddlerConfig();
  window.xiddler.isIntercepting = false;

  window.xiddler.polly.stop();
  window.xiddler.polly = null;

  return window.xiddler.isIntercepting;
}

/** 初始化 Xiddler */
export function initXiddler() {
  ensureXiddlerConfig();

  // 避免重复初始化
  if (window.xiddler.isInitialized) {
    return window.xiddler;
  }

  // 初始化数据库
  window.xiddler.db = initDB();

  window.xiddler.isInitialized = true;

  return window.xiddler;
}

export function getDB() {
  return window.xiddler.db;
}

export function getIsIntercepting() {
  return window.xiddler.isIntercepting;
}

export function setApiStatus(api, status) {
  checkXiddlerStatus();

  const preference = window.xiddler.preference;

  // 存在则移除，否则添加
  if (preference[status].indexOf(api) > -1) {
    preference[status] = preference[status].filter((_api) => _api !== api);
  } else {
    preference[status] = [...preference[status], api];
  }

  // 持久化存储数据
  window.localStorage.setItem(XFIDDLER_PREFERENCE, JSON.stringify(preference));

  return preference[status];
}

/** 设置 API 下线，即返回 503 状态码  */
export function setApiOffline(api) {
  return setApiStatus(api, 'offlineApis');
}

/** 设置 API 重放，即返回上一次的结果 */
export function setApiRecallable(api) {
  return setApiStatus(api, 'recallableApis');
}

/** 设置 API 降级，即永远返回正确  */
export function setApiDegraded(api) {
  return setApiStatus(api, 'degradedApis');
}

/** 确保 Xiddler 基础配置存在 */
export function ensureXiddlerConfig() {
  // 判断 window 下的 xiddler 对象是否存在，如果不存在则初始化创建
  if (!window.xiddler) {
    let preference = {
      // 需要被下线、重放、降级的接口
      offlineApis: [],
      recallableApis: [],
      degradedApis: []
    };

    try {
      const storedPreference = JSON.parse(
        localStorage.getItem(XFIDDLER_PREFERENCE)
      );

      preference = {
        ...preference,
        ...storedPreference
      };
    } catch (e) {
      logError(e);
    }

    window.xiddler = {
      isInitialized: false,
      isIntercepting: false,

      // 这里将数据库与拦截器对象挂载到全局，避免被 GC
      db: null,
      polly: null,

      preference
    };
  }

  return window.xiddler;
}

/** 检测 Xiddler 当前的状态 */
export function checkXiddlerStatus() {
  if (!window.xiddler || !window.xiddler.isInitialized || !window.xiddler.db) {
    throw new Error('[Error] Xiddler 尚未初始化!');
  }
}
