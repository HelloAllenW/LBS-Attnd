import * as adStorage from '../utils/adStorage';
import * as adLog from '../utils/adLog';

export const addUserAttndRecord = async ({ date, startTime, endTime }) => {
  const payload = { date, startTime, endTime };
  adLog.log('addUserAttndRecord-params', payload);
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'createUserAttndRecords',
      data: { ...payload }
    });
    if (result.code !== 2000) {
      throw result;
    }
    adLog.log('addUserAttndRecord-set', payload);
  } catch (e) {
    adLog.warn('addUserAttndRecord-error', e);
    throw e;
  }
}

export const getUserAttndRecords = async ({ offset, offsetId }) => {
  const payload = { offset, offsetId };
  adLog.log('getUserAttndRecords-params', payload);
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'getUserAttndRecords',
      data: { offset, offsetId }
    });
    if (result.code !== 2000) throw result;
    // format 时间
    adLog.log('getUserAttndRecords-result', result);
    // result.data.list = result.data.list.map(item => {
    //   item.createTime = formatDate(item.createTime);
    //   return item;
    // });
    return result;
  } catch (e) {
    adLog.warn('getUserAttndRecords-error', e);
    throw e;
  }
}