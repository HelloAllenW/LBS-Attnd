import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { getUserInfo } from '../../services/userInfo';
import { getAttndByPassWd } from '../../services/attnd';
import './index.less';
import imgLocation from '../../assets/images/location.png';
import selectedIcon from '../../assets/images/selected.png';
import hasAttnd from '../../assets/images/hasAttnd.png';
import avatarLyx from '../../assets/images/avatar-lyx.jpeg';
import * as adLog from '../../utils/adLog';
import { getLocation } from '../../services/location';
import { signin } from '../../services/signin';
import AdToast from '../../components/AdToast';
import * as adStorage from '../../utils/adStorage';

export default class Index extends Component {

  config = {
    navigationBarTitleText: '萌兴考勤',
    backgroundColor: '#f2f2f2'
  }

  state = {
    windowHeight: 0,
    isAdmin: false, // true表示为管理员，需要展示管理员页面。false表示为普通员工，需展示打卡页面
    hostName: '',
    attndArress: '',
    attndStartTime: '',
    attndEndTime: '',
    currentDate: '',
    passWd: ''
  }

  async componentDidMount() {
    this.computeHeight();
    // 获取当前用户角色及当前用户的考勤时间段
    this.getUserInfo()
    setInterval(()=>{
      var now = new Date();
      this.setState({
        currentDate: now.toLocaleTimeString()
      })
    }, 1000);
  }

  getUserInfo = async () => {
    try {
      const result = await getUserInfo();
      if (result.code === 2000) {
        const { isAdmin, passWd } = result.data;
        // 根据 passWd 来获取考勤信息
        const res = await getAttndByPassWd({ passWd });
        const { hostName, attndArress, attndStartTime, attndEndTime } = res.data
        adStorage.set('isAdmin', isAdmin);
        this.setState({ hostName, attndArress, attndStartTime, attndEndTime, passWd, isAdmin });
      }
    } catch (e) {
      adLog.warn('GetUserInfo-error', e);
    }
  }

  onShareAppMessage() {
    return {
      title: '快来参加考勤吧！',
      path: '/pages/Home/index',
      imageUrl: imgLocation
    }
  }

  computeHeight = () => {
    try {
      const { windowHeight } = wx.getSystemInfoSync();
      this.setState({ windowHeight });
    } catch (e) {
      console.log(e);
    }
  }

  onSignin = async () => {
    const { passWd } = this.state;
    wx.showLoading({ title: '请稍后', mask: true });
    try {
      // 获取签到这当前位置
      const location = await getLocation();
      if (!location) {
        wx.hideLoading();
        wx.navigateTo({ url: '/pages/EditAuth/index' });
        return;
      }
      const res = await signin({
        passWd,
        location
      });
      this.signinLoading = false;
      wx.hideLoading();
      switch (res.code) {
        case 2000: // 成功
          Taro.adToast({ text: '签到成功', status: 'success' }, () => {
            this.onRefresh();
          });
          break;
        case 3002: // 已签到
          Taro.adToast({ text: '已签到', status: 'success' }, () => {
            this.onRefresh();
          });
          break;
        case 3003: // 个人信息不完整
          wx.showModal({
            title: '个人信息',
            content: '请完善个人信息',
            confirmText: '前往',
            confirmColor: '#78a4fa',
            success: res => res.confirm && wx.navigateTo({ url: '/pages/EditUserInfo/index' })
          });
          break;
        case 3004: // 签到人数超过限制
          Taro.adToast({ text: '抱歉，签到人数超过限制，最多为 100 人', duration: 2500 }, () => {
            this.onRefresh();
          });
          break;
        default:
          break;
      }
    } catch (e) {
      this.signinLoading = false;
      wx.hideLoading();
      adLog.warn('Signin-error', e);
      if (typeof e === 'object' && e.errCode === 5001) {
        Taro.adToast({ text: '操作频繁，请稍后再试～' }, () => {
          this.onRefresh();
        });
        return;
      }
      Taro.adToast({ text: '抱歉，无法签到' }, () => {
        this.onRefresh();
      });
    }
  }

  onRefresh() {

  }

  onFindAttndClick = () => wx.navigateTo({ url: '/pages/FindAttnd/index' });

  onEditAttndClick = () => wx.navigateTo({ url: '/pages/EditAttnd/index' });

  render() {
    const { windowHeight, isAdmin, hostName, attndArress, attndStartTime, attndEndTime, currentDate } = this.state;
    return (
      <View>
      <View className="home">
        {isAdmin && <View className="home__wrapper" style={{ height: `${windowHeight / 2}px` }}>
          <View className="home__signin home__opt" onClick={this.onFindAttndClick}>
            <View className="home__circle">签</View>
            <View className="home__text">签到 / 加入小组</View>
          </View>
        </View> }
        {isAdmin && <View className="home__wrapper" style={{ height: `${windowHeight / 2}px` }}>
          <View className="home__attnd home__opt" onClick={this.onEditAttndClick}>
            <View className="home__circle">勤</View>
            <View className="home__text">发起考勤</View>
          </View>
        </View>}

        {/* 用户考勤页面 */}
        {!isAdmin && <View className="home__user_wrapper" style={{ height: `${windowHeight*0.2}px` }}>
          <View className="home__user_opt home__user_info">
            <Image
              className="user_icon"
              lazyLoad mode="aspectFill"
              src={avatarLyx}
            />
            <View className="title">
              <Text className="title1">{hostName  || 'loading..'}</Text>
              <Text className="title2">{attndArress  || 'loading..'}</Text>
            </View>
          </View>
        </View> }
        {!isAdmin && <View className="home__user_wrapper" style={{ height: `${windowHeight*0.8}px` }}>
          <View className="home__user_opt">
            <View className="top">
              <View className="topLeft bg">
                <Text className="title1">上班{attndStartTime  || 'loading..'}</Text>
                <View className="home__user_text">
                  <Image
                    className="hasAttnd"
                    lazyLoad mode="aspectFill"
                    src={hasAttnd}
                  />
                  <Text className="title2">07:32已打卡</Text>
                </View>
              </View>
              <View className="topRight bg">
                <Text className="title1">下班{attndEndTime  || 'loading..'}</Text>
                <View className="home__user_text">
                  <Image
                    className="hasAttnd"
                    lazyLoad mode="aspectFill"
                    src={hasAttnd}
                  />
                  <Text className="title2">07:32已打卡</Text>
                </View>
              </View>
            </View>
            <View className="center">
              <View className="home__user_circle" onClick={this.onSignin}>
                <Text>上班打卡</Text>
                <Text className="current_time">{currentDate}</Text>
              </View>
              <View className="home__user_text">
                <Image
                    className="selectedIcon"
                    lazyLoad mode="aspectFill"
                    src={selectedIcon}
                  />
                <Text className="tip">已进入考勤范围</Text>
              </View>
            </View>
          </View>
        </View> }
      </View>
      <AdToast />
      </View>
    )
  }
}
