//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    openid: '',
    session_key: '',
    matches: [],
    weekday: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    matchDate: [],
    matchTime: [],
    dateTime: [],
    isDoing: [],
    teamAPic: [],
    teamBPic: []
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

  },
  intoCreategame: function () {
    wx.navigateTo({
      url: '../creategame/creategame',
    })
  },
  getMatchList(openid) {
    var page = this
    wx.request({
      url: app.globalData.serverUrl + 'lqh/apis/match/list',
      data: {
        openId: openid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log('sucess')
        page.setData({
          matches: res.data.datas
        })
        // page.getMatchDate(res.data.datas[0].matchTime)
        for (var i = 0; i < page.data.matches.length; i++) {
          var a = page.getMatchDate(page.data.matches[i].matchTime)
          var strArray = a.split("|")
          if (i == 0) {
            page.data.matchDate = []
            page.data.matchTime = []
            page.data.isDoing = []
            page.data.dateTime = []
            page.data.teamAPic = []
            page.data.teamBPic = []
          }
          var dateArray = page.data.matchDate.concat(strArray[0]);
          var timeArray = page.data.matchTime.concat(strArray[1]);
          var doingArray = page.data.isDoing.concat(strArray[2])
          var dateTimeArray = page.data.dateTime.concat(strArray[3])
          page.setData({
            matchDate: dateArray,
            matchTime: timeArray,
            isDoing: doingArray,
            dateTime: dateTimeArray
          })
        }
      },
      fail: function (res) {
        console.log('fail')
      }
    })
  },
  getMatchDate: function (str) {
    var page = this
    var strArray = str.split(" ");
    var strDate = strArray[0].split("-");
    var strTime = strArray[1].split(":");
    var a = new Date(strDate[0], (strDate[1] - parseInt(1)), strDate[2], strTime[0], strTime[1], strTime[2])
    var currentDate = new Date()
    var doing = false
    if (a.getTime() > currentDate.getTime()) {
      doing = true
    }
    var date = strDate[0] + "年" + (strDate[1]) + "月" + strDate[2] + "日" + page.data.weekday[a.getDay()] + "|" + strTime[0] + ':' + strTime[1] + "|" + doing + "|" + str

    return date;
  },
  intoDetail: function (event) {
    var page = this;
    var matchId = event.currentTarget.dataset.matchid;
    var position = event.currentTarget.dataset.position;
    var matchDate = page.data.matchDate[position]
    var matchTime = page.data.matchTime[position]
    var dateTime = page.data.dateTime[position]
    wx.navigateTo({
      url: '../matchdetail/matchdetail?matchId=' + matchId + '&matchDate=' + matchDate + '&matchTime=' + matchTime + '&dateTime=' + dateTime,
    })
  },
  onShow: function () {
    var page = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      page.setData({
        userInfo: userInfo
      });
      wx.login({
        success: function (res) {
          if (res.code) {
            try {//同步获取缓存
              var userData = wx.getStorageSync('userData');
            } catch (e) {

            }
            if (userData.openid) {
              page.getMatchList(userData.openid);
              //从本地获取缓存的openid和session_key
              app.globalData.openid = userData.openid
              app.globalData.session_key = userData.session_key
              page.setData({
                openid: userData.openid,
                session_key: userData.session_key
              });
              wx.hideNavigationBarLoading()
              wx.stopPullDownRefresh()
            } else {
              wx.request({
                url: app.globalData.serverUrl + 'lqh/apis/ci/user/openId',
                data: {
                  code: res.code + '',
                  userName: userInfo.nickName,
                  userImg: userInfo.avatarUrl,
                },
                // header: {
                //   'content-type': 'application/x-www-form-urlencoded'
                // },
                success: function (res) {
                  page.getMatchList(res.data.data.openid);
                  wx.setStorage({
                    key: 'userData',
                    data: res.data.data,
                  });
                  app.globalData.openid = res.data.data.openid
                  app.globalData.session_key = res.data.data.session_key
                  page.setData({
                    openid: res.data.data.openid,
                    session_key: res.data.data.session_key
                  });
                  wx.hideNavigationBarLoading()
                  wx.stopPullDownRefresh()
                },
                fail: function (res) {
                  console.log(res);
                }
              })
            }
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
    });
  },
  onPullDownRefresh: function () {
    var page = this;
    wx.showNavigationBarLoading()
    page.onShow()

  },
  onShareAppMessage: function (res) {
    var page = this;
    if (res.from === 'menu') {
      // 来自页面内转发按钮
    }
    return {
      title: '比赛报名通知都在用寻球小程序\n方便快捷统计，队长的好帮手',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
