let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        list: [],
        status: 1
    },

    state: {
        options: {},
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
    onLoad: function(options) {
        this.state.options = options;
        if (options.status == 1) {
            wx.setNavigationBarTitle({
                title: '我的-粉丝',
                success() {}
            })
        }
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })

        this.requestGetList(0);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
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
    onReachBottom: function() {
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

    // 进入主页
    viewDetail(event) {
        let id = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/zhishiDetail/zhishiDetail?id=' + id
        })
    },

    // 获取关注列表
    requestGetList(offset) {
        let that = this;
        let op = that.state.options;
        let url = 'api/SelfCenter/getInfo';
        let data = {
            offset,
            limit: that.state.limit,
            status: op.status
        }
        if (op.hasOwnProperty("uid")) {
            data["uid"] = op.uid;
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext,
                    status: that.state.options.status
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 取消关注
    requestCancalAttention(event) {
        let that = this;
        let list = that.data.list;
        let index = event.currentTarget.dataset.index;
        let url = 'api/SelfCenter/attention';
        let data = {
            id: list[index].id,
            status: 2
        }

        wx.showModal({
            title: '提示',
            content: "确定取消关注",
            showCancel: true,
            success(_res) {
                console.log(_res)
                if (_res.confirm) {
                    wx.showLoading({
                        title: '',
                        mask: true
                    })
                    util.httpRequest(url, data).then((res) => {
                        wx.hideLoading();
                        if (res.result === 'success') {
                            list.splice(index, 1);
                            that.setData({
                                list
                            })
                        } else {
                            common.showClickModal(res.msg);
                        }
                    })
                }
            }
        });
    }
})