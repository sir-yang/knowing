let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

let WxParse = require('../../wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        details: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestDetail(options);
    },


    // 调用详情接口
    requestDetail(opt) {
        let that = this;
        let url = 'api/System/getPage';
        if (opt.hasOwnProperty('page')) {
            url = 'api/SelfMessage/getPage';
        }
        util.httpRequest(url, {
            id: opt.id
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                that.setData({
                    requestStatus: true,
                    details: res.results
                })
                setTimeout(() => {
                    if (res.results.content) {
                        let wxData = WxParse.wxParse('article', 'html', res.results.content, that, 5);
                        that.setData(wxData);
                    }
                }, 200)
            } else {
                common.showClickModal(res.msg);
            }
        });
    }

})