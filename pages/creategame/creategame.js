var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    time: "",
    date: "",
    isOpen: false,
    isBOpen: false,
    jerseyPicName: 'redJersey.png',
    opponentJerseyPicName: 'redJersey.png',
    jersey: [{
      color: '红色',
      picName: 'redJersey.png',
    }, {
      color: '黄色',
      picName: 'yellowJersey.png',
    },
    {
      color: '蓝色',
      picName: 'blueJersey.png',
    },
    {
      color: '绿色',
      picName: 'greenJersey.png',
    },
    {
      color: '紫色',
      picName: 'purpleJersey.png',
    },
    {
      color: '白色',
      picName: 'whiteJersey.png',
    },
    {
      color: '黑色',
      picName: 'blackJersey.png',
    },
    {
      color: '橙色',
      picName: 'orangeJersey.png',
    },
    {
      color: '灰色',
      picName: 'grayJersey.png',
    }],
    fieldName: '',
    teamName: '',
    opponentName: '',
    longitude: "",
    latitude: "",
    teamAcolor: "红色",
    teamBcolor: "红色"
  },
  onLoad: function (options) {
    var page = this;
    // 页面初始化 options为页面跳转所带来的参数
    var dateTime = util.formatTime(new Date);
    var dateT = dateTime.split("|");
    page.setData({
      date: dateT[0],
      time: dateT[1]
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  openMap: function () {
    var page = this;
    wx.chooseLocation({
      success: function (res) {
        page.setData({
          longitude: res.longitude + '',
          latitude: res.latitude + ''
        })
      }
    })
  },
  kindToggle: function (event) {
    var page = this;
    var position = event.currentTarget.dataset.position;
    if (position != null) {
      page.setData({
        jerseyPicName: page.data.jersey[position].picName,
        teamAcolor: page.data.jersey[position].color
      })
    }

    if (page.data.isOpen) {
      page.setData({
        isOpen: false
      })
    } else {
      page.setData({
        isOpen: true
      })
    }
  },
  kindBToggle: function (event) {
    var page = this;
    var position = event.currentTarget.dataset.position;
    if (position != null) {
      page.setData({
        opponentJerseyPicName: page.data.jersey[position].picName,
        teamBcolor: page.data.jersey[position].color
      })
    }
    if (page.data.isBOpen) {
      page.setData({
        isBOpen: false
      })
    } else {
      page.setData({
        isBOpen: true
      })
    }
  },
  interRemark: function () {
    wx.navigateTo({
      url: '../remark/remark',
    })
  },
  confirm: function () {
    var page = this;
    var date = new Date();
    var currentTime = date.getTime()
    var strDate = page.data.date.split("-")
    var strTime = page.data.time.split(":")
    var gameTime = new Date(strDate[0], (strDate[1] - parseInt(1)), strDate[2], strTime[0], strTime[1])
    var matchTime = gameTime.getTime()
    try {
      var remarkContent = wx.getStorageSync("remarkContent")
    } catch (e) {

    }
    if (currentTime > matchTime) {
      page.showModal("比赛时间不能小于当前时间");
    } else if (util.isNull(page.data.fieldName)) {
      page.showModal("球场名不能为空");
    } else if (util.isNull(page.data.teamName)) {
      page.showModal("球队名不能为空");
    } else if (util.isNull(page.data.opponentName)) {
      page.showModal("对方球队名不能为空");
    } else if (util.isNull(remarkContent)) {
      remarkContent = '无'
      page.postCreateMatch(remarkContent)
    } else {
      page.postCreateMatch(remarkContent)
    }

  },

  fieldNameChange: function (e) {
    var page = this;
    page.setData({
      fieldName: e.detail.value
    })
  },
  teamNameChange: function (e) {
    var page = this;
    page.setData({
      teamName: e.detail.value
    })
  },
  opponentNameChange: function (e) {
    var page = this;
    page.setData({
      opponentName: e.detail.value
    })
  },
  showModal: function (content) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
        }
      }
    })
  },
  postCreateMatch: function (remarkContent) {
    var page = this
    try {//同步获取缓存
      var userData = wx.getStorageSync('userData');
    } catch (e) {

    }
    // var teamAcolor = "红色"
    // var teamBcolor = "红色"
    // if (page.data.jerseyPicName == "yellowJersey.png") {
    //   teamAcolor = "黄色"
    // } else if (page.data.jerseyPicName == "blueJersey.png") {
    //   teamAcolor = "蓝色"
    // }

    // if (page.data.opponentJerseyPicName == "yellowJersey.png") {
    //   teamBcolor = "黄色"
    // } else if (page.data.opponentJerseyPicName == "blueJersey.png") {
    //   teamBcolor = "蓝色"
    // }
    wx.request({
      url: app.globalData.serverUrl + '/lqh/apis/match/create',
      method: 'POST',
      data: {
        openId: userData.openid,
        matchTime: page.data.date + page.data.time,
        pitchName: page.data.fieldName,
        teamAcolor: page.data.teamAcolor,
        teamBcolor: page.data.teamBcolor,
        teamAname: page.data.teamName,
        teamBname: page.data.opponentName,
        numLimit: 30,
        fee: 5.0,
        memo: remarkContent,
        longitude: page.data.longitude,
        latitude: page.data.latitude
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status > 0) {
          wx.removeStorage({
            key: 'remarkContent',
            success: function (res) {

            },
          })
          wx.navigateBack({

          })
        }
      },
      fail: function (res) {
      }
    })
  }
})