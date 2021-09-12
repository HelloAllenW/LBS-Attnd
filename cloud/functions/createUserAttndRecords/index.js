const cloud = require('wx-server-sdk');
cloud.init({
  env: 'envlzp-110d2c-5gfxk5li814596a9',
  // env: 'devlzp-8cqxl',
});

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const userAttndRecordsCollection = db.collection('userAttndRecords');
  const { date, startTime, endTime } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  try {
    await userAttndRecordsCollection.add({
      data: {
        openId,
        date,
        startTime,
        endTime,
        createTime: new Date(),
        updateTime: new Date()
      }
    });
    return { code: 2000 };
  } catch (e) {
    console.log(e);
    if (typeof e === 'object' && e.errCode === -502001) {
      return { code: 5001, msg: e };
    }
    return { code: 5000, msg: e };
  }
}