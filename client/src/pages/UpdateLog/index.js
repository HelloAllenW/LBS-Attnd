import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.less';

export default class UpdateLog extends Component {

  config = {
    navigationBarTitleText: '更新日志'
  }

  state = {
    logs: [
      {
        version: 'v1.0.0 @2021.10.01',
        points: [
          '萌兴考勤小程序上线！'
        ]
      }
    ]
  }

  render() {
    const { logs } = this.state;
    return (
      <View className="update-log">
        {logs.map(log => (
          <View className="update-log__item" key={log.version}>
            <View className="update-log__item--version">{log.version}</View>
            {log.points.map(point => (
              <View className="update-log__item--point" key={point}>{point}</View>
            ))}
          </View>
        ))}
      </View>
    );
  }
}
