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
        this.requestGetAbout();
    },

    // 接口获取详情
    requestGetAbout() {
        let that = this;
        let url = 'api/Configs/about';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (res.results.about) {
                    let wxData = WxParse.wxParse('article', 'html', res.results.about, that, 5);
                    that.setData(wxData);
                }
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})