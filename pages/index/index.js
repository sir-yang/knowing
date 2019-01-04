Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        typeTab: 0,
        sortTab: 0,
        onlookersTk: 'hide',// 围观弹框
        posterTk: 'hide' //海报弹框
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
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
        wx.hideLoading();
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


    // 事件处理
    questionAnswerEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'typeTab') {
            that.setData({
                typeTab: dataset.index
            })
        } else if (dataset.types === 'sortTab') {
            that.setData({
                sortTab: dataset.index
            })
        } else if (dataset.types === 'detail') {//详情
            wx.hideTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'show'
                    })
                }
            });
        } else if (dataset.types === 'onlookers') {//围观弹框
            wx.showActionSheet({
                itemList: ["分享围观","一元围观"],
                success(res){
                    console.log(res.tapIndex);
                }
            })
        } else if (dataset.types === 'closeTk') {//关闭围观弹框
            wx.showTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'hide'
                    })
                }
            })
        }
    }
})