import Taro, { Component } from '@tarojs/taro';
import { View, Picker } from '@tarojs/components';
import { AtInput, AtButton, AtSwitch } from 'taro-ui';
import AdToast from '../../components/AdToast';
import { getLocation, getAddress } from '../../services/location';
import { createAttnd } from '../../services/attnd';
// import { getAllGroups } from '../../services/group';
import * as adLog from '../../utils/adLog';
import './index.less';

export default class EditAttnd extends Component {

  config = {
    navigationBarTitleText: ''
  }

  state = {
    attndName: '',
    isAttndNameErr: false,
    attndArress: '',
    attndStartTime: '',
    attndEndTime: ''
  }

  submiting = false;

  onInputChange = (value) => {
    this.setState({
      attndName: value,
      isAttndNameErr: false
    });
  }
  onAddressChange = (value) => {
    this.setState({
      attndArress: value
    });
  }
  onStartTimeChange = (value) => {
    this.setState({
      attndStartTime: value
    });
  }
  onEndTimeChange = (value) => {
    this.setState({
      attndEndTime: value
    });
  }

  checkFormData = (attndName) => {
    if (!attndName.trim()) {
      Taro.adToast({ text: '名称不能为空' });
      this.setState({ isAttndNameErr: true });
      return false;
    }
    return true;
  }

  onSubmit = async () => {
    const { attndName, attndArress, attndStartTime, attndEndTime } = this.state;
    if (!this.checkFormData(attndName)) {
      return;
    }
    if (this.submiting) return;
    this.submiting = true;

    wx.showLoading({ title: '请稍后', mask: true });

    try {
      // 获取地理位置
      const location = await getLocation();

      // 未授权获取位置
      if (!location) {
        this.submiting = false;
        wx.hideLoading();
        wx.navigateTo({ url: '/pages/EditAuth/index' });
        return;
      }

      // 用于地图显示的 gcj02 坐标
      const gcj02Location = await getLocation('gcj02');

      // 获取逆地址解析（地理位置描述）
      const address = await getAddress();

      const res = await createAttnd({
        attndName,
        location,
        address,
        gcj02Location,
        attndArress,
        attndStartTime,
        attndEndTime
      });

      this.submiting = false;
      wx.hideLoading();

      // 未填写个人信息
      if (res.code === 3003) {
        wx.showModal({
          title: '个人信息',
          content: '请完善个人信息',
          confirmText: '前往',
          confirmColor: '#78a4fa',
          success: res => res.confirm && wx.navigateTo({ url: '/pages/EditUserInfo/index' })
        });
        return;
      }

      const passWd = res.data.passWd;
      Taro.adToast({ text: '发起成功', status: 'success' });
      setTimeout(() => wx.redirectTo({ url: `/pages/ShowPassWd/index?passWd=${encodeURIComponent(passWd)}` }), 1500);
    } catch (e) {
      adLog.warn('EditAttnd-error', e);
      wx.hideLoading();
      if (typeof e === 'object' && e.errCode === 5001) {
        Taro.adToast({ text: '操作频繁，请稍后再试～' });
        return;
      }
      Taro.adToast({ text: '发起失败' });
    }
    this.submiting = false;
  }

  render() {
    const { attndName, isAttndNameErr, attndArress, attndStartTime, attndEndTime } = this.state;
    const desc1 = '* 小程序通过 GPS 定位，确定考勤有效范围是以你当前位置为中心的方圆 200 米，在有效范围内完成签到者视为已到';

    return (
      <View className="edit-attnd">
        <View className="edit-attnd__title">发起考勤</View>
        <View>
          <View className="edit-attnd__desc">{desc1}</View>
        </View>
        <View className="edit-attnd__form">
          <View className="edit-attnd__input">
            <AtInput
              type='text'
              placeholder='输入考勤名称'
              placeholderStyle="color: #cccccc"
              error={isAttndNameErr}
              maxLength={150}
              value={attndName}
              onChange={this.onInputChange}
            />
          </View>
          <View className="edit-attnd__input">
            <AtInput
              type='text'
              placeholder='输入考勤地址（仅用于用户页面展示）'
              placeholderStyle="color: #cccccc"
              maxLength={150}
              value={attndArress}
              onChange={this.onAddressChange}
            />
          </View>
          <View className="edit-attnd__input">
            <AtInput
              type='text'
              placeholder='输入考勤开始时间（如：9:00）'
              placeholderStyle="color: #cccccc"
              maxLength={150}
              value={attndStartTime}
              onChange={this.onStartTimeChange}
            />
          </View>
          <View className="edit-attnd__input">
            <AtInput
              type='text'
              placeholder='输入考勤结束时间（如：18:00）'
              placeholderStyle="color: #cccccc"
              maxLength={150}
              value={attndEndTime}
              onChange={this.onEndTimeChange}
            />
          </View>
        </View>
        <View className="edit-attnd__btn">
          <AtButton type="primary" onClick={this.onSubmit}>立即发起</AtButton>
        </View>
        <AdToast />
      </View>
    )
  }
}
