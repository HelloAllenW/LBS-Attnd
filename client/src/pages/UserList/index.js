import { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import AttndList from '../../components/AttndList';
import * as adLog from '../../utils/adLog';
import { getUserList, updateUserInfoByPassWd } from '../../services/userInfo';
import { getAllAttnds } from '../../services/attnd';
import './index.less';
import { AtActionSheet, AtActionSheetItem } from "taro-ui"

export default class UserList extends Component {

  config = {
    navigationBarTitleText: '用户列表'
  }

  constructor() {
    try {
      var { windowHeight } = wx.getSystemInfoSync();
    } catch (e) {
      console.log(e);
    }
    this.state = {
      listHeight: windowHeight || 0,
      UserList: [],
      userHasMore: true,
      groupOffsetId: null,
      actionSheetIsOpen: false,
      attndsData: [],
      currentUserId: ''
    };
  }

  groupLoading = false;

  componentDidMount() {
    this.getUserList();
    this.getAllAttnds();
  }

  // 获取用户列表
  getUserList = async (offset = 0) => {
    try {
      const { groupOffsetId, UserList } = this.state;
      // 请求第 1 页时激活 loadMore 节点
      if (offset === 0) {
        this.setState({ userHasMore: true });
      }
      if (this.groupLoading) return;
      this.groupLoading = true;

      const {
        data: { hasMore, offsetId, list }
      } = await getUserList({
        offset,
        offsetId: groupOffsetId
      });

      // offset === 0 时更新偏移基准 offsetId
      if (offset === 0 && offsetId) {
        this.setState({ groupOffsetId: offsetId });
      }

      this.setState({
        UserList: offset === 0 ? list : UserList.concat(list),
        userHasMore: hasMore
      });
    } catch (e) {
      adLog.log('getUserList-error', e);
    }
    this.groupLoading = false;
  }

  // 获取attnd列表
  getAllAttnds = async () => {
    try {
      const result = await getAllAttnds();
      if (result.code === 2000) {
        this.setState({ attndsData: result.data })
      }
    } catch (e) {
      adLog.warn('getAllAttnds-error', e);
    }
  }

  onGroupLoadMore = async () => {
    const offset = this.state.UserList.length;
    this.getUserList(offset);
  }

  getUserListData = (data = []) => {
    return data.map(item => ({
      key: item._id,
      title: item.name,
      desc1: `地址：${item.address || 'loading..'}`,
      desc2: `个人电话：${item.phoneNum || 'loading..'}  紧急联系人：${item.contactPhoneNum || 'loading..'}`,
      desc3: `部门：${item.department || 'loading..'} 工号：${item.stuId}`,
      tag: { active: true, text: `口令：${item.passWd}` }
    }));
  }

  onTagClick = async (item) => {
    this.setState({
      currentUserId: item.key
    })
    this.setState({actionSheetIsOpen:true})
  }

  // 更新用户考勤类型
  handleClick = async (passWd) => {
    const id = this.state.currentUserId
    try {
      if (this.groupLoading) return;
      this.groupLoading = true;
      const result = await updateUserInfoByPassWd({id, passWd});
      if (result.code === 2000) {
        this.getUserList()
      }
    } catch (e) {
      adLog.warn('updateUserInfoByPassWd-error', e);
    }
    this.groupLoading = false;
  }

  render() {
    const { listHeight, UserList, userHasMore, actionSheetIsOpen, attndsData } = this.state;
    const computeUserList = this.getUserListData(UserList);

    return (
      <View className="group-list">
        <AttndList
          height={listHeight}
          data={computeUserList}
          hasMore={userHasMore}
          onLoadMore={this.onGroupLoadMore}
          onTagClick={this.onTagClick}
        />
        <AtActionSheet
          isOpened={actionSheetIsOpen}
          cancelText='取消'
          title='请为当前用户绑定考勤'>
            {
              attndsData.map(item => {
                return (
                  <AtActionSheetItem onClick={ () => this.handleClick(item.passWd) }>
                    {item.passWd}-{item.attndArress}
                  </AtActionSheetItem>
                );
              })
            }
        </AtActionSheet>
      </View>
    );
  }
}