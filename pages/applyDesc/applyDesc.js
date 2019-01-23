let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
let WxParse = require('../../wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestRefundDesc();
    },

    // 使用说明
    requestRefundDesc() {
        let that = this;
        let url = 'api/Configs/apply';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (res.results.apply) {
                    let wxData = WxParse.wxParse('article', 'html', res.results.apply, that, 5);
                    that.setData(wxData);
                }
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})