let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        account: '',
        list: []
    },

    state: {
        hasmore: true,
        offset: 0, //从第几条数据开始查询
        limit: 10, //每页条数
        pageOnShow: false,
        isOnReachBottom: true,
        isonPullDownRefresh: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestGetAccount();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (!this.state.pageOnShow) return;
        this.requestGetAccount();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.state.isonPullDownRefresh = true;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.state.offset = 0;
        this.state.hasmore = true;
        this.requestGetList(0);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.state.isonPullDownRefresh) return;
        if (!this.state.isOnReachBottom) return;
        if (!this.state.hasmore) return;
        wx.showLoading({
            title: '',
            mask: true
        });
        this.state.offset = this.state.offset + this.state.limit;
        this.requestGetList(this.state.offset);
        this.state.isOnReachBottom = false;
    },

    // 事件
    walletEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'wattle') {
            wx.navigateTo({
                url: '/my/pages/withdraw/withdraw'
            })
        }
    },

    // 个人账户
    requestGetAccount() {
        let that = this;
        let url = 'api/Account/getPage';
        util.httpRequest(url).then((res) => {
            that.requestGetList(0);
            if (res.result === 'success') {
                that.setData({
                    account: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 资金记录
    requestGetList(offset) {
        let that = this;
        let url = 'api/AccountLog/getPage';
        let data = {
            offset,
            limit: that.state.limit
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})