let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        tabIndex: 0,
        list: [],
        content: '分享经济包括不同人或组织之间对生产资料、产品、分销渠道、处于交易或消费过程中的商品和服务的分享。这个拉斯单撒开单费'
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
        });
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.requestGetList(0);
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                that.requestGetList(0);
            };
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let text = this.data.content;
        if (text.length > 49) {
            text = common.stringObject(text, 49);
            this.setData({
                content: text
            })
        }
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

    // 事件
    knowShareEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if (dataset.index == this.data.tabIndex) return;
            this.setData({
                tabIndex: dataset.index,
                list: []
            })
            wx.showLoading({
                title: '',
                mask: true
            })
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'morecont') {
            let list = this.data.list;
            let index = dataset.index;
            list[index].more = !list[index].more;
            this.setData({
                list
            })
        } else if (dataset.types === 'seeImg') {
            let list = this.data.list;
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
        } else if (dataset.types === 'ignore') { //忽略
            this.requestReview(2, dataset.index);
        } else if (dataset.types === 'agree') { //同意
            this.requestReview(1, dataset.index);
        }
    },

    // 获取列表
    requestGetList(offset) {
        let that = this;
        let url = 'api/share/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            audit: that.data.tabIndex
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                handle.list.forEach((item) => {
                    item.more = false;
                    if (item.content.length > 49) {
                        item.desc = common.stringObject(item.content, 49);
                        item.more = true;
                    }
                })
                console.log(handle.list)
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

    // 审核
    requestReview(status, index) {
        let that = this;
        let list = that.data.list;
        let url = 'api/Share/edits';
        let data = {
            id: list[index].id,
            audit: status
        }
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    mask: true,
                    success() {
                        list.splice(index, 1);
                        that.setData({
                            list
                        })
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})