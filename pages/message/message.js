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
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    // 事件
    messageEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'mine') {
            url = '/pages/myMsg/myMsg';
        } else if (dataset.types === 'system') {
            url = '/pages/systemMsg/systemMsg';
        } else if (dataset.types === 'private') {
            url = '/pages/privateMsg/privateMsg';
        } else if (dataset.types === 'know') {
            url = '/pages/knowShare/knowShare';
        }
        wx.navigateTo({
            url
        })
    }

})