let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
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
    onLoad: function(options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestGetMsgList(0);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (!this.state.pageOnShow) return;
        this.state.offset = 0;
        this.requestGetMsgList(0);
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
        this.requestGetMsgList(0);
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
        this.requestGetMsgList(this.state.offset);
        this.state.isOnReachBottom = false;
    },

    // 查看详情
    viewDetail(event) {
        let index = event.currentTarget.dataset.index;
        let list = this.data.list;
        let id = list[index].objId;
        let url = '';
        if (list[index].type === 1 || list[index].type === 6) { //评论、点赞
            url = '/enjoy/pages/enjoyDetail/enjoyDetail?id=' + id;
        } else if (list[index].type === 3 || list[index].type === 4) { //回答、围观
            url = '/wenda/pages/wendaDetail/wendaDetail?id=' + id;
        } else if (list[index].type === 5) { //关注
            url = '/common/pages/attentionList/attentionList?status=1';
        }
        wx.navigateTo({
            url
        })
    },

    // 获取消息列表
    requestGetMsgList(offset) {
        let that = this;
        let url = 'api/SelfMessage/getPage';
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