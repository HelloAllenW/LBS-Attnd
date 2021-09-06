import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtForm, AtInput, AtButton } from 'taro-ui';
import { updateUserInfo, getUserInfo } from '../../services/userInfo';
import { AdToast } from '../../components/AdToast';
import { isStuIdValid } from '../../utils/func';
import * as adLog from '../../utils/adLog';
import './index.less';

export default class EditUserInfo extends Component {

  config = {
    navigationBarTitleText: '个人信息'
  }

  state = {
    name: '',
    stuId: '',
    phoneNum: '',
    address: '',
    contactPhoneNum: '',
    department: '',
    isNameErr: false,
    isStuIdErr: false,
    pulling: false,
    submiting: false
  }

  componentDidMount() {
    this.getUserInfo();
  }

  onNameChange = (value) => {
    this.setState({
      name: value,
      isNameErr: false
    });
  }

  onStuIdChange = (value) => {
    this.setState({
      stuId: value,
      isStuIdErr: false
    });
  }

  onPhoneNumChange = (value) => {
    this.setState({
      phoneNum: value
    })
  }
  onAddressChange = (value) => {
    this.setState({
      address: value
    })
  }
  onContactPhoneNumChange = (value) => {
    this.setState({
      contactPhoneNum: value
    })
  }
  onDepartmentChange = (value) => {
    this.setState({
      department: value
    })
  }

  checkFormData = (name, stuId) => {
    if (!name.trim()) {
      Taro.adToast({ text: '姓名不能为空' });
      this.setState({ isNameErr: true });
      return false;
    }
    if (!isStuIdValid(stuId)) {
      Taro.adToast({ text: '工号只能为字母、数字和横杠' });
      this.setState({ isStuIdErr: true });
      return false;
    }
    return true;
  }

  getUserInfo = async () => {
    const { pulling } = this.state;
    if (pulling) return;
    this.setState({ pulling: true });
    wx.showLoading({ title: '获取信息', mask: true });
    try {
      const result = await getUserInfo();
      if (result.code === 2000) {
        const { name, stuId, phoneNum, 
          address, contactPhoneNum, department } = result.data;
        this.setState({ name, stuId, phoneNum, address, contactPhoneNum, department });
      }
    } catch (e) {
      adLog.warn('EditUserInfo-error', e);
    }
    this.setState({ pulling: false });
    wx.hideLoading();
  }

  onSubmit = async () => {
    const { name, stuId, phoneNum,
      address, contactPhoneNum, department,
      submiting, pulling } = this.state;
    if (!this.checkFormData(name, stuId)) {
      return;
    }
    if (submiting || pulling) return;
    this.setState({ submiting: true });
    try {
      await updateUserInfo({
        name: name.trim(),
        stuId: stuId.trim(),
        phoneNum: phoneNum.trim(),
        address: address.trim(),
        contactPhoneNum: contactPhoneNum.trim(),
        department: department.trim()
      });
      Taro.adToast({ text: '保存成功', status: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      adLog.warn('EditUserInfo-error', e);
      if (typeof e === 'object' && e.errCode === 5001) {
        Taro.adToast({ text: '操作频繁，请稍后再试～' });
        return;
      }
      Taro.adToast({ text: '保存失败' });
    }
    this.setState({ submiting: false });
  }

  render() {
    const { submiting, name, stuId, phoneNum, 
      isNameErr, isStuIdErr, address,
      contactPhoneNum, department } = this.state;
    return (
      <View className="edit-userinfo">
        <View className="edit-userinfo__form">
          <AtForm>
            <AtInput
              title='姓名'
              type='text'
              placeholder="填写真实姓名（必填）"
              placeholderStyle="color: #cccccc"
              error={isNameErr}
              maxLength={150}
              value={name}
              onChange={this.onNameChange}
            />
            <AtInput
              title='工号'
              type='text'
              placeholder="填写工号"
              placeholderStyle="color: #cccccc"
              error={isStuIdErr}
              maxLength={150}
              border={false}
              value={stuId}
              onChange={this.onStuIdChange}
            />
            <AtInput
              title='电话'
              type='text'
              placeholder="填写电话"
              placeholderStyle="color: #cccccc"
              maxLength={150}
              border={false}
              value={phoneNum}
              onChange={this.onPhoneNumChange}
            />
            <AtInput
              title='家庭住址'
              type='text'
              placeholder="填写家庭住址"
              placeholderStyle="color: #cccccc"
              maxLength={150}
              border={false}
              value={address}
              onChange={this.onAddressChange}
            />
            <AtInput
              title=' 紧急联系人'
              type='text'
              placeholder="填写紧急联系人电话"
              placeholderStyle="color: #cccccc"
              maxLength={150}
              border={false}
              value={contactPhoneNum}
              onChange={this.onContactPhoneNumChange}
            />
            <AtInput
              title='部门'
              type='text'
              placeholder="填写部门（作业队）"
              placeholderStyle="color: #cccccc"
              maxLength={150}
              border={false}
              value={department}
              onChange={this.onDepartmentChange}
            />
          </AtForm>
        </View>
        <View className="edit-userinfo__btn">
          <AtButton
            type="primary"
            loading={submiting}
            onClick={this.onSubmit}
          >保存
          </AtButton>
        </View>
        <AdToast />
      </View>
    )
  }
}
