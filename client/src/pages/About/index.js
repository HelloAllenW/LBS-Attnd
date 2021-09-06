import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import AdToast from '../../components/AdToast';
import avatarLzy from '../../assets/images/avatar-lzy.jpg';
import avatarLyx from '../../assets/images/avatar-lyx.jpeg';
import './index.less';

export default class About extends Component {

  config = {
    navigationBarTitleText: '关于我们'
  }

  state = {
    t1: '萌兴考勤',
    aps1: [
      '萌兴考勤是基于 LBS 开发的考勤和签到小程序，用于公司所有人员的考勤管理'
    ],
    t3: '中交二公局萌兴工程有限公司',
    aps3: [
      '中交二公局萌兴工程有限公司（简称萌兴公司）于2001年成立于古城西安，是世界500强——中国交通建设股份有限公司旗下中交第二公路工程局有限公司的全资子公司。企业注册资本2.01亿元，年施工能力30亿元以上，经营范围涵盖公路、桥梁、铁路、隧道、市政、房建、交通工程及水环境治理等多个领域。'
    ],
    t4: '技术支持',
    contributors: [
      { avatar: avatarLzy, name: 'King Arthur' },
      { avatar: avatarLyx, name: 'Allen' }
    ],
    t5: '联系 Contact',
    aps5: [
      '18691970403'
    ]
  }

  onCopy = (str) => {
    if (!str) return;
    wx.setClipboardData({
      data: str,
      success: () => Taro.adToast({ text: '拷贝成功', status: 'success' })
    });
  }

  checkUpdateLog = () => wx.navigateTo({ url: '/pages/UpdateLog/index' });

  render() {
    const { t1, t2, t3, t4, t5, aps1, aps2, aps3, aps5 } = this.state;
    return (
      <View className="about">
        {/* 考勤 Attnd */}
        <View className="about__title">{t1}</View>
        <View>
          {aps1.map(p => <View key={p} className="about__paragraph">{p}</View>)}
        </View>
        {/* 开发 Development */}
        <View className="about__title">{t3}</View>
        <View>
          {aps3.map(p => <View key={p} className="about__paragraph">{p}</View>)}
          <View className="about__paragraph"><Text onClick={() => this.checkUpdateLog()} className="about__link">查看更新日志</Text></View>
        </View>
        {/*联系 Contact*/}
        <View className="about__title">{t5}</View>
        <View>
          {aps5.map(p => <View key={p} className="about__paragraph">微信：<Text onClick={() => this.onCopy(p)} className="about__link">{p}</Text></View>)}
        </View>
        {/* 贡献者 Contributors */}
        <View className="about__title">{t4}</View>
        <View className="about__flexbox">
          {contributors.map(ctr => (
            <View key={ctr.name} className="about__contributors">
              <Image
                className="about__contributors--avatar"
                lazyLoad mode="aspectFill"
                src={ctr.avatar}
              />
              <View className="about__contributors--name">{ctr.name}</View>
            </View>
          ))}
        </View>
        <AdToast />
      </View>
    )
  }
}
