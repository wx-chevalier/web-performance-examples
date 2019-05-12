/** 全局日志工具，便于网络传递 */
export const isDebug = process.env.NODE_ENV === 'development';

export function logDebug(...args) {
  if (isDebug) {
    // eslint-disable-next-line
    console.log(...args);
  }
}

export function logInfo(...args) {
  // eslint-disable-next-line
  console.log(...args);
}

export function logError(...args) {
  // eslint-disable-next-line
  console.error(...args);
}
