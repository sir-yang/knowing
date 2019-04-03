let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
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
        let userInfo = common.getStorage('userInfo');
        this.setData({
            userInfo,
            requestStatus: true
        })
    },

    // 监听页面显示
    onShow() {
        // 消息状态
        common.requestMessage(this);
    },

    // 事件
    messageEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'mine') {
            url = '/common/pages/myMsg/myMsg';
        } else if (dataset.types === 'system') {
            url = '/common/pages/systemMsg/systemMsg';
        } else if (dataset.types === 'private') {
            url = '/common/pages/privateMsg/privateMsg';
        } else if (dataset.types === 'know') {
            url = '/common/pages/knowShare/knowShare';
        }
        wx.navigateTo({
            url
        })
    }

})