let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        content: ''
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
        let url = 'api/Configs/refuse';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                that.setData({
                    content: res.results.refuse
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})