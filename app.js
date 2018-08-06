//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);

  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        ihjgghj
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail: function (res) {
          that.setPermission()
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    serverUrl: 'https://apis.xunqiu.mobi/',
    openid: '',
    session_key: ''
  },
  setPermission: function () {
    var page = this
    wx.showModal({
      title: '警告',
      content: '若不授权微信登陆，则无法使用寻球预约比赛；点击重新获取授权，则可重新使用；若点击不授权，后期还使用小程序，需在微信【发现】——【小程序】——删掉【寻球】，重新搜索授权登陆，方可使用',
      confirmText: '授权',
      cancelText: '不授权',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.openSetting({
            success: function (res) {
              // if (!res.authSetting["scope.userInfo"] || !res.authSetting["scope.userLocation"]) {
              //   //这里是授权成功之后 填写你重新获取数据的js
              //   //参考:
              //   // page.getUserInfo()
              // }

            },
            fail: function (res) {
              wx.showToast({
                title: '无法获取信息',
              })
            }
          })
        } else if (res.cancel) {
          console.log('======cancle')
        }
      }
    })
  }
})
