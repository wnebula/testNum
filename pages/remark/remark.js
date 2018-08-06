var util = require('../../utils/util.js')
Page({
  data: {
    textValue: "",
    remarkContent: "",
    isFocus: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // try { 
    //   var remarkContent = wx.getStorageSync('remarkContent')
    // }
    // catch (e) {

    // }
    var page = this;
    wx.getStorage({
      key: 'remarkContent',
      success: function (res) {
        page.setData({
          remarkContent: res.data,
          textValue: res.data
        })
      },
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
  bindRemark: function (e) {
    var page = this;
    page.setData({
      remarkContent: e.detail.value
    })
  },
  confirm: function () {
    var page = this
    page.setData({
      isFocus: false
    })
    if (util.isNull(page.data.remarkContent)) {
      wx.showModal({
        title: '提示',
        content: '备注不能为空',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            page.setData({
              isFocus: true
            })
          }
        }
      })
    } else {
      try {
        wx.setStorageSync('remarkContent', page.data.remarkContent)
      } catch (e) {
      }
      wx.navigateBack({
      })
    }
  }
})