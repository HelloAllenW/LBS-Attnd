const cloud = require('wx-server-sdk');
cloud.init({
  env: 'envlzp-110d2c-5gfxk5li814596a9',
  // env: 'devlzp-8cqxl',
});

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const attndCollection = db.collection('attnd');
  console.log('event', event);
  const MAX_LIMIT = 100;

  try {
    // 先取出集合记录总数
    const { total } = await attndCollection.count();
    
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100);

    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = attndCollection.where({
        active: _.eq(true)
      }).field({
        members: false
      }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
      tasks.push(promise);
    }

    // 等待所有
    // res = { data: [], errMsg }
    const { data } = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    });

    return {
      code: 2000,
      data: data.reverse()
    }
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}