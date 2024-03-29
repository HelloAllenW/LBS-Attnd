import * as adStorage from '../utils/adStorage';
import * as adLog from '../utils/adLog';

export const updateUserInfo = async ({ name, stuId, phoneNum,
  address, contactPhoneNum, department, avatarUrl }) => {
  const payload = { name, stuId, phoneNum, 
    address, contactPhoneNum, department, avatarUrl };
  adLog.log('updateUserInfo-params', payload);
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: { ...payload }
    });
    if (result.code !== 2000) {
      throw result;
    }
    adLog.log('updateUserInfo-set', payload);
    // 更新缓存
    adStorage.set('userInfo', payload);
    adLog.log('updateUserInfo-setStorage', payload);
  } catch (e) {
    adLog.warn('updateUserInfo-error', e);
    throw e;
  }
}

export const getUserInfo = async (isFromStorage = false) => {
  
  // 从缓存获取
  if (isFromStorage) {
    const userInfo = adStorage.get('userInfo');
    if (userInfo) {
      const result = {
        code: 2000,
        data: userInfo
      };
      adLog.log('getUserInfo-getStorage', result);
      return result;
    }
  }

  // 从数据库获取
  try {
    // result: { code: 2000, data: { name: 'Lyokoo', stuId: '123' } }
    const { result } = await wx.cloud.callFunction({
      name: 'getUserInfo'
    });
    if (result.code !== 2000 && result.code !== 3001) {
      throw result;
    }
    const { data } = result;
    adLog.log('getUserInfo-getFromDB', data);

    // 更新缓存
    if (result.code === 2000) {
      adStorage.set('userInfo', data);
      adLog.log('getUserInfo-setStorage', data);
    }

    return result;
  } catch (e) {
    adLog.warn('getUserInfo-error', e);
    throw e;
  }
}

// 获取小组列表
export const getUserList = async ({ offset, offsetId }) => {
  const payload = { offset, offsetId };
  adLog.log('getUserList-params', payload);
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'getUserList',
      data: { offset, offsetId }
    });
    if (result.code !== 2000) throw result;
    adLog.log('getUserList-result', result);
    return result;
  } catch (e) {
    adLog.warn('getUserList-error', e);
    throw e;
  }
}

export const updateUserInfoByPassWd = async ({ id, passWd }) => {
  const payload = { id, passWd };
  adLog.log('updateUserInfoByPassWd-params', payload);
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'updateUserInfoByPassWd',
      data: { ...payload }
    });
    if (result.code !== 2000) {
      throw result;
    }
  } catch (e) {
    adLog.warn('updateUserInfoByPassWd-error', e);
    throw e;
  }
}