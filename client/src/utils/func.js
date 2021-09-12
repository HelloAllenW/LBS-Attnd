export const isStuIdValid = (stuId) => {
  if (typeof stuId !== 'string') return false;
  const re = /^[0-9a-zA-Z\-]*$/g;
  const len = stuId.replace(re, '').length;
  if (len === 0) return true;
  return false;
};

export const throttle = (func, wait) => {
  let now, previous = 0;
  return function (...args) {
    now = +new Date();
    if (now - previous > wait) {
      func.apply(this, [...args]);
      previous = now;
    }
  }
};

export const debounce = (func, wait, immediate) => {
  let timeId = null;
  return function (...args) {
    clearTimeout(timeId);
    // 立即执行
    if (immediate) {
      if (!timeId) func.apply(this, [...args]);
      timeId = setTimeout(() => {
        timeId = null;
      }, wait);
    }
    // 停止后执行
    else {
      timeId = setTimeout(() => {
        func.apply(this, [...args]);
      }, wait);
    }
  }
};

export const formatDate = (dateLike) => {
  if (!dateLike) return '';
  const date = new Date(dateLike);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const format = (n) => {
    const str = n + '';
    return str[1] ? n : `0${n}`;
  }
  return `${[year, month, day].map(format).join('-')} ${[hour, min].map(format).join(':')}`;
}

export const getDistance = (lng1, lat1, lng2, lat2) => {
  if (lng1 === lng2 && lat1 === lat2) {
    return 0;
  }
  let radLat1 = lat1 * Math.PI / 180.0;
  let radLat2 = lat2 * Math.PI / 180.0;
  let a = radLat1 - radLat2;
  let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // 🌍 地球半径
  // s = s * 6371.393; // 🌍 真正地球半径
  s = Math.round(s * 10000) / 10000;
  return s * 1000;
};