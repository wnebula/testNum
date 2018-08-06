var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    matchDate: '',
    teamAname: '',
    teamBname: '',
    pitchName: '',
    attends: [],
    uncertains: [],
    leaves: [],
    matchId: '',
    teamAcolor: '红色',
    teamBcolor: '红色',
    picPath: '',
    remark: '',
    longitude: '',
    latitude: '',
    matchTime: '',
    isOwner: false,
    isDoing: false,
    sharePath: '',
    isAttends: false,
    isUncertains: false,
    isLeaves: false,
    teamBImg: '',
    mineState: 4,
    isCancle: false,
    shareMessage: '',
    weekDay: ['日', '一', '二', '三', '四', '五', '六']
  },
  onShareAppMessage: function (res) {
    var page = this;
    if (res.from === 'menu') {
      // 来自页面内转发按钮
    }
    return {
      title: page.data.shareMessage + '，' + page.data.matchTime + '，对手:' + page.data.teamBname + '\n各位队友快进来报名!',
      path: page.data.sharePath,
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
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var page = this;
    var doing = page.getIsDoing(options.dateTime)
    page.setData({
      matchDate: options.matchDate,
      matchId: options.matchId,
      matchTime: options.matchTime,
      isDoing: doing,
      sharePath: '/pages/matchdetail/matchdetail?matchDate=' + options.matchDate + '&matchId=' + options.matchId + '&matchTime=' + options.matchTime + '&dateTime=' + options.dateTime
    })
    page.getMatchInfo(options.matchId)
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
  getMatchInfo: function (id) {
    var page = this
    wx.request({
      url: app.globalData.serverUrl + 'lqh/apis/match/detail',
      data: {
        matchId: id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resp) {
        if (resp.data.status > 0) {
          if (resp.data.data.status == 1) {
            page.setData({
              isCancle: true
            })
          }
          page.setData({
            teamAname: resp.data.data.teamAname,
            teamBname: resp.data.data.teamBname,
            pitchName: resp.data.data.pitchName,
            teamAcolor: resp.data.data.teamAcolor,
            teamBcolor: resp.data.data.teamBcolor,
            remark: resp.data.data.memo,
            longitude: resp.data.data.longitude,
            latitude: resp.data.data.latitude
          })
          if (util.isNull(app.globalData.openid)) {
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
                      //从本地获取缓存的openid和session_key
                      app.globalData.openid = userData.openid
                      app.globalData.session_key = userData.session_key
                      page.setData({
                        openid: userData.openid,
                        session_key: userData.session_key
                      });
                      page.getUserStatu(resp, id)
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
                        success: function (res) {
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
                          page.getUserStatu(resp, id)
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
          } else {
            page.getUserStatu(resp, id)
          }
        } else {
          page.setData({ isDoing: false })
        }
      },
      fail: function (res) {

      }
    })
  },
  //获取各种状态的人数信息；
  getStateCount: function (id, isFirst) {
    var page = this
    wx.request({
      url: app.globalData.serverUrl + 'lqh/apis/match/signs',
      data: {
        matchId: id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        page.setData({
          attends: res.data.attends,
          uncertains: res.data.uncertains,
          leaves: res.data.leaves
        })
        if (isFirst) {
          if (res.data.attends.length > 0) {
            for (var i = 0; i < res.data.attends.length; i++) {
              if (res.data.attends[i].openId == app.globalData.openid) {
                page.setData({
                  mineState: 2
                })
              }
            }
          }
          if (res.data.uncertains.length > 0) {
            for (var i = 0; i < res.data.uncertains.length; i++) {
              if (res.data.uncertains[i].openId == app.globalData.openid) {
                page.setData({
                  mineState: 0
                })
              }
            }
          }
          if (res.data.leaves.length > 0) {
            for (var i = 0; i < res.data.leaves.length; i++) {
              if (res.data.leaves[i].openId == app.globalData.openid) {
                page.setData({
                  mineState: 1
                })
              }
            }
          }
          if (page.data.mineState == 0) {
            page.setData({
              isAttends: false,
              isUncertains: true,
              isLeaves: false
            })
          } else if (page.data.mineState == 1) {
            page.setData({
              isAttends: false,
              isUncertains: false,
              isLeaves: true
            })
          } else if (page.data.mineState == 2) {
            page.setData({
              isAttends: true,
              isUncertains: false,
              isLeaves: false
            })
          } else {
            page.setData({
              isAttends: false,
              isUncertains: false,
              isLeaves: false
            })
          }
        }
      },

      fail: function (res) {

      }
    })
  },
  setUncertains: function () {
    var page = this;
    if (page.data.isCancle) {
      wx.showToast({
        title: '比赛已取消',
      })
    } else {
      if (page.data.isDoing) {
        page.setData({
          isAttends: false,
          isUncertains: true,
          isLeaves: false
        })
        page.postStatus(0);
      } else {
        wx.showToast({
          title: '报名已结束',
        })
      }
    }
  },
  setAttends: function () {
    var page = this
    if (page.data.isCancle) {
      wx.showToast({
        title: '比赛已取消',
      })
    } else {
      if (page.data.isDoing) {
        page.setData({
          isAttends: true,
          isUncertains: false,
          isLeaves: false
        })
        page.postStatus(2);
      } else {
        wx.showToast({
          title: '报名已结束',
        })
      }
    }
  },
  setLeaves: function () {
    var page = this;
    if (page.data.isCancle) {
      wx.showToast({
        title: '比赛已取消',
      })
    } else {
      if (page.data.isDoing) {
        page.setData({
          isAttends: false,
          isUncertains: false,
          isLeaves: true
        })
        page.postStatus(1);
      } else {
        wx.showToast({
          title: '报名已结束',
        })
      }
    }
  },
  //设置待定等状态；
  postStatus: function (statu) {
    var page = this;
    // matchId 	true 	int 	
    // openId 	true 	String 	openId
    // status 	true 	int 	0 待定，1，请假，2到场
    // realName 	false 	string 	姓名
    // telphone 	false 	string 	电话 
    // lqh/apis/match/status
    wx.request({
      url: app.globalData.serverUrl + 'lqh/apis/match/status',
      method: 'POST',
      data: {
        matchId: page.data.matchId,
        openId: app.globalData.openid,
        status: statu
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status > 0) {
          page.getStateCount(page.data.matchId, false)
        }
      },
      fail: function (res) {

      }
    })
  },
  openMatchMap: function () {
    var page = this;
    if (util.isNull(page.data.longitude)) {
      wx.showToast({
        title: '队长未设置',
        duration: 2000
      })
    } else {
      wx.openLocation({
        latitude: page.data.latitude,
        longitude: page.data.longitude,
      })
    }
  },
  deleteMatch: function () {
    var page = this;
    if (page.data.isCancle) {
      wx.showToast({
        title: '比赛已取消',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确定删除该比赛信息?',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.serverUrl + 'lqh/apis/match/cancel',
              method: 'POST',
              data: {
                matchId: page.data.matchId,
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                if (res.data.status > 0) {
                  wx.showToast({
                    title: '删除成功',
                  })
                  wx.navigateBack({

                  })
                }
              },
              fail: function (res) {

              }
            })
          }
        }
      })
    }
  },
  getIsDoing: function (str) {
    var page = this
    var strArray = str.split(" ");
    var strDate = strArray[0].split("-");
    var strTime = strArray[1].split(":");
    var a = new Date(strDate[0], (strDate[1] - parseInt(1)), strDate[2], strTime[0], strTime[1], strTime[2])
    var currentDate = new Date()
    var doing = false
    if (a.getTime() > currentDate.getTime()) {
      doing = true
      var oldDate = new Date(strDate[0], (strDate[1] - parseInt(1)), strDate[2])
      var newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
      var isSameWeek = page.isSameWeek(oldDate, newDate)
      var message = ''
      if (oldDate.getTime() == newDate.getTime()) {
        message = '今天'
      } else if (isSameWeek) {
        var weekday = page.data.weekDay[a.getDay()];
        message = '本周' + weekday
      } else {
        message = strDate[1] + '月' + strDate[2] + '日'
      }
      page.setData({
        shareMessage: message
      })
    } else {
      var message = (strDate[1]) + '月' + strDate[2] + '日'
      page.setData({
        shareMessage: message
      })
    }
    return doing;
  },
  deleteStatu: function () {
    var page = this
    if (page.data.isCancle) {
      wx.showToast({
        title: '比赛已取消',
      })
    } else {
      if (page.data.isDoing) {
        page.setData({
          isAttends: false,
          isUncertains: false,
          isLeaves: false
        })
        page.postStatus(-1);
      } else {
        wx.showToast({
          title: '报名已结束',
        })
      }
    }
  },
  getUserStatu: function (res, id) {
    var page = this
    if (app.globalData.openid == res.data.data.openId) {
      page.setData({ owner: true })
    }
    var color = res.data.data.teamAcolor
    var colorB = res.data.data.teamBcolor
    var picpath = "../../image/redJersey.png"
    var teamBImg = "../../image/redJersey.png"
    if (color.indexOf("黄") >= 0) {
      picpath = "../../image/yellowJersey.png"
    } else if (color.indexOf("蓝") >= 0) {
      picpath = "../../image/blueJersey.png"
    } else if (color.indexOf("绿") >= 0) {
      picpath = "../../image/greenJersey.png"
    } else if (color.indexOf("紫") >= 0) {
      picpath = "../../image/purpleJersey.png"
    } else if (color.indexOf("白") >= 0) {
      picpath = "../../image/whiteJersey.png"
    } else if (color.indexOf("黑") >= 0) {
      picpath = "../../image/blackJersey.png"
    } else if (color.indexOf("橙") >= 0) {
      picpath = "../../image/orangeJersey.png"
    } else if (color.indexOf("灰") >= 0) {
      picpath = "../../image/grayJersey.png"
    }
    if (colorB.indexOf("黄") >= 0) {
      teamBImg = "../../image/yellowJersey.png"
    } else if (colorB.indexOf("蓝") >= 0) {
      teamBImg = "../../image/blueJersey.png"
    } else if (colorB.indexOf("绿") >= 0) {
      teamBImg = "../../image/greenJersey.png"
    } else if (colorB.indexOf("紫") >= 0) {
      teamBImg = "../../image/purpleJersey.png"
    } else if (colorB.indexOf("白") >= 0) {
      teamBImg = "../../image/whiteJersey.png"
    } else if (colorB.indexOf("黑") >= 0) {
      teamBImg = "../../image/blackJersey.png"
    } else if (colorB.indexOf("橙") >= 0) {
      teamBImg = "../../image/orangeJersey.png"
    } else if (colorB.indexOf("灰") >= 0) {
      teamBImg = "../../image/grayJersey.png"
    }
    page.setData({
      picPath: picpath,
      teamBImg: teamBImg
    })
    page.getStateCount(id, true)
  },
  isSameWeek: function (old, now) {
    var oneDayTime = 1000 * 60 * 60 * 24;
    var old_count = parseInt(old.getTime() / oneDayTime);
    var now_other = parseInt(now.getTime() / oneDayTime);
    return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
  }
})