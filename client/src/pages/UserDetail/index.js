import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import AdToast from '../../components/AdToast';
import './index.less';

export default class About extends Component {

  config = {
    navigationBarTitleText: '详细信息'
  }

  state = {
    item: {},
    startTime: '',
    endTime: ''
  }

  componentWillMount() {
    const { item, startTime, endTime } = this.$router.params;
    this.setState({
      item: JSON.parse(item),
      startTime,
      endTime
    });
  }

  onCopy = (str) => {
    if (!str) return;
    wx.setClipboardData({
      data: str,
      success: () => Taro.adToast({ text: '拷贝成功', status: 'success' })
    });
  }

  render() {
    const { item, startTime, endTime } = this.state;
    return (
      <View className="about">

        <View className="about__title">姓名</View>
        <View className="about__paragraph">{item.name}</View>

        <View className="about__title">工号</View>
        <View className="about__paragraph">{item.stuId}</View>

        <View className="about__title">地址</View>
        <View className="about__paragraph">{item.address}</View>

        <View className="about__title">本人联系方式</View>
        <View className="about__paragraph"><Text onClick={() => this.onCopy(p)} className="about__link">{item.phoneNum}</Text></View>

        <View className="about__title">部门</View>
        <View className="about__paragraph">{item.department}</View>

        <View className="about__title">考勤类型</View>
        <View className="about__paragraph">{item.passWd}</View>

        <View className="about__title">考勤起始时间</View>
        <View className="about__paragraph">{startTime} - {endTime}</View>

        <View className="about__title">紧急联系人方式</View>
        <View className="about__paragraph"><Text onClick={() => this.onCopy(p)} className="about__link">{item.contactPhoneNum}</Text></View>

        <View className="about__title">创建时间</View>
        <View className="about__paragraph">{item.createTime}</View>

        <View className="about__title">头像</View>
        <View className="about__flexbox">
            <View className="about__contributors">
              <Image
                className="about__contributors--avatar"
                lazyLoad mode="aspectFill"
                src={item.avatarUrl}
              />
            </View>
        </View>
        <AdToast />
      </View>
    )
  }
}
