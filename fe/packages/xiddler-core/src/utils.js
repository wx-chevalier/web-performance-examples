/**  */
import moment from 'moment';

export function formatTime(milliseconds) {
  let result = '00:';
  const h = Math.floor(milliseconds / 3600 / 1000);
  const s = Math.floor((milliseconds - h * 3600 * 1000) / 1000);
  result += `${format2Digits(Math.floor(s / 60))}:${format2Digits(s % 60)}`;
  return result;
}

export function format2Digits(number) {
  return number < 10 ? `0${number}` : `${number}`;
}

export function formatDateTime(momentObj) {
  return moment(momentObj).format('YYYY-MM-DD HH:mm:ss');
}
