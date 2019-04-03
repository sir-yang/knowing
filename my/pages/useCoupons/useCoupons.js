let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
let WxParse = require('../../../wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestUseDesc();
    },

    // 使用说明
    requestUseDesc() {
        let that = this;
        let url = 'api/Configs/shareTicket';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                that.setData({
                    requestStatus: true
                })
                if (res.results.explain) {
                    let wxData = WxParse.wxParse('article', 'html', res.results.explain, that, 5);
                    that.setData(wxData);
                }
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})