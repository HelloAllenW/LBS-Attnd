import { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtTabs, AtTabsPane } from 'taro-ui';
import AttndList from '../../components/AttndList';
import { getAttndListByHostOpenId } from '../../services/attnd';
import { getSigninListBySigninerOpenId } from '../../services/signin';
import * as adLog from '../../utils/adLog';
import { throttle, formatDate } from '../../utils/func';
import './index.less';
import * as adStorage from '../../utils/adStorage';
import { getUserAttndRecords } from '../../services/userAttndRecords';

export default class List extends Component {

  config = {
    navigationBarTitleText: '记录'
  }

  constructor() {
    try {
      var { windowWidth, windowHeight } = wx.getSystemInfoSync();
      var rpx = windowWidth / 750;
      var headerHeight = 88 * rpx; // PX
      var listHeight = windowHeight - headerHeight;
    } catch (e) {
      console.log(e);
    }
    this.state = {
      listHeight: listHeight || 0,
      windowHeight: windowHeight || 0,
      tabIndex: 0,

      attndData: [],
      attndHasMore: true,
      attndOffsetId: null,

      // signinData: [],
      // signinHasMore: true,
      // signinOffsetId: null,

      userAttndsRecordData: [],
      userAttndsRecordHasMore: true,
      userAttndsRecordOffsetId: null,

      isAdmin: false
    };
  }

  attndLoading = false;
  signinLoading = false;
  userAttndsRecordLoading = false;

  tabList = [
    { title: '我参与的' },
    { title: '我发起的' }
  ]

  componentDidShow = throttle(function () {
    // this.getSigninList();
    this.getUserAttndsRecordList();
    this.getAttndList();
  }, 6000);

  componentDidMount() {
    const isAdmin = adStorage.get('isAdmin');
    this.setState({ isAdmin })
  }

  onTabToggle = (value) => {
    this.setState({
      tabIndex: value
    })
  }

  getUserAttndsRecord = (data = []) => {
    return data.map(item => ({
      key: item._id,
      title: item.date,
      desc1: `上班打开：${item.startTime || 'loading..'}`,
      desc2: `下班打卡：${item.endTime || 'loading..'}`,
      desc3: ``,
      tag: { active: false, text: '已打卡' }
    }));
  }

  getUserAttndsRecordList = async (offset = 0) => {
    const { userAttndsRecordOffsetId, userAttndsRecordData } = this.state;
    // 请求第 1 页时激活 loadMore 节点
    if (offset === 0) {
      this.setState({ userAttndsRecordHasMore: true });
    }
    if (this.userAttndsRecordLoading) return;
    this.userAttndsRecordLoading = true;

    try {
      const {
        data: { hasMore, offsetId, list }
      } = await getUserAttndRecords({
        offset,
        offsetId: userAttndsRecordOffsetId
      });

      // offset === 0 时更新偏移基准 offsetId
      if (offset === 0 && offsetId) {
        this.setState({ userAttndsRecordOffsetId: offsetId });
      }

      this.setState({
        userAttndsRecordData: offset === 0 ? list : userAttndsRecordData.concat(list),
        userAttndsRecordHasMore: hasMore
      });

    } catch (e) {
      adLog.log('getUserAttndsRecordList-error', e);
    }
    this.userAttndsRecordLoading = false;
  }

  getAttndList = async (offset = 0) => {
    const { attndOffsetId, attndData } = this.state;
    // 请求第 1 页时激活 loadMore 节点
    if (offset === 0) {
      this.setState({ attndHasMore: true });
    }
    if (this.attndLoading) return;
    this.attndLoading = true;

    try {
      const {
        data: { hasMore, offsetId, list }
      } = await getAttndListByHostOpenId({
        offset,
        offsetId: attndOffsetId
      });

      // offset === 0 时更新偏移基准 offsetId
      if (offset === 0 && offsetId) {
        this.setState({ attndOffsetId: offsetId });
      }

      this.setState({
        attndData: offset === 0 ? list : attndData.concat(list),
        attndHasMore: hasMore
      });

    } catch (e) {
      adLog.log('getAttndList-error', e);
    }
    this.attndLoading = false;
  }

  /*
  getSigninList = async (offset = 0) => {
    const { signinOffsetId, signinData } = this.state;
    // 请求第 1 页时激活 loadMore 节点
    if (offset === 0) {
      this.setState({ signinHasMore: true });
    }
    if (this.signinLoading) return;
    this.signinLoading = true;

    try {
      const {
        data: { hasMore, offsetId, list }
      } = await getSigninListBySigninerOpenId({
        offset,
        offsetId: signinOffsetId
      });

      // offset === 0 时更新偏移基准 offsetId
      if (offset === 0 && offsetId) {
        this.setState({ signinOffsetId: offsetId });
      }

      this.setState({
        signinData: offset === 0 ? list : signinData.concat(list),
        signinHasMore: hasMore
      });

    } catch (e) {
      adLog.log('getSigninList-error', e);
    }
    this.signinLoading = false;
  }
  */

  onAttndLoadMore = async () => {
    const offset = this.state.attndData.length;
    this.getAttndList(offset);
  }

  /*
  onSigninLoadMore = async () => {
    const offset = this.state.signinData.length;
    this.getSigninList(offset);
  }
  */

  onUserAttndRecordLoadMore = async () => {
    const offset = this.state.userAttndsRecordData.length;
    this.getUserAttndsRecordList(offset);
  }

  getComputeAttndData = (data = []) => {
    return data.map(item => ({
      key: item._id,
      title: item.attndName,
      desc1: `口令：${item.passWd || 'loading..'}`,
      desc2: `发起者：${item.hostName || 'loading..'}`,
      desc3: `时间：${formatDate(item.createTime) || 'loading..'}`,
      tag: item.attndStatus===1 ? { active: true, text: '进行中' } : { active: false, text: '已结束' }
    }));
  }

  onAttndItemClick = (index) => {
    const { attndData } = this.state;
    const passWd = attndData[index] ? attndData[index].passWd : '';
    if (!passWd) {
      return;
    }
    wx.navigateTo({ url: `/pages/SignIn/index?passWd=${encodeURIComponent(passWd)}` });
  }

  /*
  onSigninItemClick = (index) => {
    const { signinData } = this.state;
    const passWd = signinData[index] ? signinData[index].passWd : '';
    if (!passWd) {
      return;
    }
    wx.navigateTo({ url: `/pages/SignIn/index?passWd=${encodeURIComponent(passWd)}` });
  }
  */

  render() {
    const {
      listHeight,
      windowHeight,
      tabIndex,
      attndData,
      attndHasMore,
      // signinData,
      // signinHasMore,
      isAdmin,
      userAttndsRecordData,
      userAttndsRecordHasMore
    } = this.state;

    // const computeSigninData = this.getComputeAttndData(signinData);
    const computeAttndData = this.getComputeAttndData(attndData);
    const computeUserAttndsRecordData = this.getUserAttndsRecord(userAttndsRecordData)

    return (
      <View className="list">
        {isAdmin && <AtTabs
          current={tabIndex}
          tabList={this.tabList}
          onClick={this.onTabToggle}
          swipeable
          height={`${windowHeight}px`}
        >
          <AtTabsPane current={tabIndex} index={0} >
            {/* <AttndList
              height={listHeight}
              data={computeSigninData}
              hasMore={signinHasMore}
              onLoadMore={this.onSigninLoadMore}
              onItemClick={this.onSigninItemClick}
            /> */}
            <AttndList
              height={listHeight}
              data={computeUserAttndsRecordData}
              hasMore={userAttndsRecordHasMore}
              onLoadMore={this.onUserAttndRecordLoadMore}
            />
          </AtTabsPane>
          <AtTabsPane current={tabIndex} index={1}>
            <AttndList
              height={listHeight}
              data={computeAttndData}
              hasMore={attndHasMore}
              onLoadMore={this.onAttndLoadMore}
              onItemClick={this.onAttndItemClick}
            />
          </AtTabsPane>
        </AtTabs>}
        {!isAdmin && <AttndList
          height={listHeight}
          data={computeUserAttndsRecordData}
          hasMore={userAttndsRecordHasMore}
          onLoadMore={this.onUserAttndRecordLoadMore}
        />}
      </View>
    )
  }
}
