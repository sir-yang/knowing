let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        list: [],
        contentVal: ''
    },

    state: {
        hasmore: true,
        offset: 0, //从第几条数据开始查询
        limit: 30, //每页条数
        pageOnShow: false,
        isOnReachBottom: true,
        isonPullDownRefresh: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.state.uid = options.uid;
        let userInfo = common.getStorage('userInfo');
        this.setData({
            userInfo
        })
        wx.showLoading({
            title: '请稍后...',
            mask: true
        });
        this.requestMsgDetailList(0);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        if (this.state.isonPullDownRefresh || !this.state.hasmore) {
            wx.stopPullDownRefresh();
            return false;
        };
        wx.showLoading({
            title: '',
            mask: true
        });
        
        this.state.isonPullDownRefresh = true;
        this.state.offset = this.state.offset + this.state.limit;
        this.requestMsgDetailList(this.state.offset);
    },

    // 获取消息详情
    requestMsgDetailList(offset) {
        let that = this;
        let url = 'api/Letter/getPage';
        let data = {
            id: that.state.uid,
            offset,
            limit: that.state.limit
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = that.dataListHandle(res, offset);
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 发送消息
    requestSendMsg(event) {
        let that = this;
        let url = 'api/Letter/save';
        if (common.isNull(event.detail.value.content)) {
            common.showTimeToast('内容不能为空');
            return false;
        }
        let data = {
            uid: that.state.uid,
            content: event.detail.value.content,
            wx_form_id: event.detail.formId
        }
        util.httpRequest(url, data, 'POST').then((res) => {
            console.log(res);
            let list = that.data.list;
            let userInfo = that.data.userInfo;
            if (res.result === 'success') {
                let item = {
                    content: event.detail.value.content,
                    user: {
                        avatarUrl: userInfo.avatarUrl,
                        id: userInfo.id
                    }
                }
                list.push(item);
                that.setData({
                    list,
                    contentVal: ''
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 列表接口数据处理
    dataListHandle(data, offset) {
        let that = this;
        let list = that.data.list;
        wx.stopPullDownRefresh();
        if (data.count > 0) {
            if (offset === 0) {
                list = data.results;
            } else {
                list = data.results.concat(list);
            }
        } else if (offset === 0) {
            list = [];
        }
        let hasNext = true;
        if (data.hasOwnProperty('next')) {
            console.log('count:' + data.count + ';next:' + data.next);
            if (data.next === 0) {
                that.state.hasmore = false;
                hasNext = false;
                if (offset != 0) {
                    common.showTimeToast('已显示全部');
                }
            } else {
                that.state.hasmore = true;
                hasNext = true;
            }
        } else {
            that.state.hasmore = false;
        }

        that.state.pageOnShow = true;
        that.state.isonPullDownRefresh = false;
        wx.hideLoading();
        return {
            list,
            hasNext,
            count: data.count
        };
    }
})