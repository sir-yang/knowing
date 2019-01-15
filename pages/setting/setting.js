let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 事件
    settingEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'info') {
            url = '/pages/personalInfo/personalIfon';
        } else if (dataset.types === 'customer') { // 客服
            url = '/pages/customer/customer';
        } else if (dataset.types === 'about') { // 关于
            url = '/pages/about/about';
        } else if (dataset.types === 'sign') { //登出
            this.requestSignOut();
            return;
        }

        wx.navigateTo({
            url
        })
    },

    // 调用登出
    requestSignOut() {
        let that = this;
        let url = 'api/Login/loginOut';
        util.httpRequest(url).then((res) => {
            if (res.result === 'success') {
                wx.switchTab({
                    url: '/index/index/index'
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})