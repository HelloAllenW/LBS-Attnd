const cloud = require('wx-server-sdk');
cloud.init({
  env: 'envlzp-110d2c-5gfxk5li814596a9',
  // env: 'devlzp-8cqxl',
});

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const attndCollection = db.collection('attnd');
  const { passWd, attndStatus } = event;
  const { openId } = event.userInfo;
  console.log('event', event);
  const statusSet = new Set([0, 1]);

  if (typeof passWd !== 'string' || !passWd
    || typeof attndStatus !== 'number' || !statusSet.has(attndStatus)) {
    return { code: 4000 };
  }

  try {
    const { stats: { updated } } = await attndCollection.where({
      passWd: _.eq(passWd),
      hostOpenId: _.eq(openId),
      active: true
    }).update({
      data: { attndStatus }
    });
    console.log({ updated });
    if (updated !== 1) {
      throw new Error('更新失败');
    }
    return { code: 2000 };
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}