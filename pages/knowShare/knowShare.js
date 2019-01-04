// pages/knowShare/knowShare.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 0,
        content: '分享经济包括不同人或组织之间对生产资料、产品、分销渠道、处于交易或消费过程中的商品和服务的分享。这个拉斯单撒开单费'
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
        let text = this.data.content;
        if (text.length > 49) {
            text = text.substring(0,49);
            this.setData({
                content: text
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 事件
    knowShareEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if(dataset.index == this.data.tabIndex) return;
            this.setData({
                tabIndex: dataset.index
            })
        }
    }
})