import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { getUserInfo } from '../../services/userInfo';
import { getAttndByPassWd } from '../../services/attnd';
import './index.less';
import imgLocation from '../../assets/images/location.png';
import selectedIcon from '../../assets/images/selected.png';
import hasAttnd from '../../assets/images/hasAttnd.png';
import * as adLog from '../../utils/adLog';
import { getLocation } from '../../services/location';
import { signin } from '../../services/signin';
import AdToast from '../../components/AdToast';
import * as adStorage from '../../utils/adStorage';
import { AtAvatar } from 'taro-ui'
import { addUserAttndRecord } from '../../services/userAttndRecords';
import { getDistance } from '../../utils/func';

export default class Index extends Component {

  config = {
    navigationBarTitleText: '萌兴考勤',
    backgroundColor: '#f2f2f2'
  }

  state = {
    windowHeight: 0,
    isAdmin: false, // true表示为管理员，需要展示管理员页面。false表示为普通员工，需展示打卡页面
    name: '',
    attndArress: '',
    attndStartTime: '',
    attndEndTime: '',
    currentDate: '',
    passWd: '',
    avatarUrl: '',
    firstAttnd: false,
    firstAttndTime: '',
    secondAttnd: false,
    secondAttndTime: '',
    outOfDistance: false
  }

  async componentDidMount() {
    this.computeHeight();
    // 获取当前用户角色及当前用户的考勤时间段
    this.getUserInfo()

    // 获取当前打卡状态
    const firstAttndTime = adStorage.get('hasFirstAttnd');
    const secondAttndTime = adStorage.get('hasSeconddAttnd');
    if (firstAttndTime) {
      this.setState({
        firstAttnd: true,
        firstAttndTime
      })
    }
    if (secondAttndTime) {
      this.setState({
        secondAttnd: true,
        secondAttndTime
      })
    }

    // 获取当前时间
    setInterval(()=>{
      var now = new Date();
      this.setState({
        currentDate: this.addZero(now.getHours()) + ':'
        + this.addZero(now.getMinutes()) + ':' + this.addZero(now.getSeconds())
      })
      if (parseInt(now.getHours()) === 23
        && parseInt(now.getMinutes()) === 59
        && parseInt(now.getSeconds()) === 0) {
        // 保存当天考勤记录到数据库
        this.saveUserAttndRecord(now)
      }
      if (parseInt(now.getHours()) === 0
        && parseInt(now.getMinutes()) === 0
        && parseInt(now.getSeconds()) === 0) { // 0点清空当天签到记录
        adStorage.set('hasFirstAttnd', '');
        adStorage.set('hasSeconddAttnd', '');
        this.setState({
          firstAttnd: false,
          secondAttnd: false
        })
      }
    }, 1000);
  }

  saveUserAttndRecord = async (now) => {
    await addUserAttndRecord({
      date: `${now.getMonth() + 1}月${now.getDate()}日`,
      startTime: this.state.firstAttndTime,
      endTime: this.state.secondAttndTime
    });
  }

  getUserInfo = async () => {
    try {
      const result = await getUserInfo();
      if (result.code === 2000) {
        const { isAdmin, passWd, avatarUrl, name } = result.data;

        // 根据 passWd 来获取考勤信息
        const res = await getAttndByPassWd({ passWd });
        const { attndArress, attndStartTime, attndEndTime, location } = res.data
        adStorage.set('isAdmin', isAdmin);
        this.setState({ name, attndArress, attndStartTime, attndEndTime, passWd, isAdmin, avatarUrl });

        // 获取我的位置
        const myLocation = await getLocation();
        console.log('myLocation', myLocation)
        console.log('location', location)
        const distance = getDistance(myLocation.lng, myLocation.lat, location.lng, location.lat)
        console.log('距离考勤距离：', distance)
        if (distance >= 0 && distance <= 500) {
          this.setState({
            outOfDistance: false
          })
        } else {
          this.setState({
            outOfDistance: true
          })
        }
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
          // 记录签到成功的状态
          var myDate = new Date();
          const time = this.addZero(myDate.getHours()) + ':' + this.addZero(myDate.getMinutes())
          if (adStorage.get('hasFirstAttnd')) { // 今天已经签到过一次
            // 下班打卡
            this.setState({
              secondAttnd: true,
              secondAttndTime: time
            })
            adStorage.set('hasSeconddAttnd', time);
          } else {
            // 上班打卡
            adStorage.set('hasFirstAttnd', time);
            this.setState({
              firstAttnd: true,
              firstAttndTime: time
            })
          }
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

  outOfSingin() {
    Taro.adToast({ text: '超出考勤范围', status: 'error' });
  }

  addZero(num) {
    if (parseInt(num) < 10) {
      num = '0'+num;
    }
    return num
  }

  onRefresh() {}

  onFindAttndClick = () => wx.navigateTo({ url: '/pages/FindAttnd/index' });

  onEditAttndClick = () => wx.navigateTo({ url: '/pages/EditAttnd/index' });

  render() {
    const { windowHeight, isAdmin, name, attndArress,
      attndStartTime, attndEndTime, currentDate, avatarUrl,
      firstAttndTime, secondAttndTime, outOfDistance, firstAttnd } = this.state;
    const getAvatar = () => (name && name[0]) ? name[0] : '';
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
            {avatarUrl && <AtAvatar className="avatar" circle image={avatarUrl}></AtAvatar>}
            {!avatarUrl && <Text className="avatar">{getAvatar()}</Text>}
            <View className="title">
              <Text className="title1">{name  || 'loading..'}</Text>
              <Text className="title2">{'考勤地址：' + attndArress  || 'loading..'}</Text>
            </View>
          </View>
        </View> }
        {!isAdmin && <View className="home__user_wrapper" style={{ height: `${windowHeight*0.8}px` }}>
          <View className="home__user_opt">
            <View className="top">
              <View className="topLeft bg">
                <Text className="title1">上班{attndStartTime  || 'loading..'}</Text>
                <View className="home__user_text">
                  {firstAttnd && <Image
                    className="hasAttnd"
                    lazyLoad mode="aspectFill"
                    src={hasAttnd}
                  />}
                  {firstAttnd && <Text className="title2">{firstAttndTime}已打卡</Text>}
                  {!firstAttnd && <Text className="title2">未打卡</Text>}
                </View>
              </View>
              <View className="topRight bg">
                <Text className="title1">下班{attndEndTime  || 'loading..'}</Text>
                <View className="home__user_text">
                  {secondAttnd && <Image
                    className="hasAttnd"
                    lazyLoad mode="aspectFill"
                    src={hasAttnd}
                  />}
                  {secondAttnd && <Text className="title2">{secondAttndTime}已打卡</Text>}
                  {!secondAttnd && <Text className="title2">未打卡</Text>}
                </View>
              </View>
            </View>
            <View className="center">
              <View
                className={outOfDistance?'home__user_circle home__user_circle_disabled':'home__user_circle'}
                onClick={outOfDistance?this.outOfSingin:this.onSignin}>
                <Text>{firstAttnd?'下班':'上班'}打卡</Text>
                <Text className="current_time">{currentDate}</Text>
              </View>
              {!outOfDistance && <View className="home__user_text">
                <Image
                    className="selectedIcon"
                    lazyLoad mode="aspectFill"
                    src={selectedIcon}
                  />
                <Text className="tip">已进入考勤范围</Text>
              </View>}
              {outOfDistance && <View className="home__user_text">
                <Text className="tip">超出考勤范围</Text>
              </View>}
            </View>
          </View>
        </View> }
      </View>
      <AdToast />
      </View>
    )
  }
}
