let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        typeIndex: 1,
        tabIndex: 0,
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
        let that = this;
        wx.showLoading({
            title: '请稍后...',
            mask: true
        });
        let token = common.getAccessToken();
        if (token) {
            that.requestKnowList(0);
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestKnowList(0);
            };
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
        this.requestKnowList(0);
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
        this.requestKnowList(this.state.offset);
        this.state.isOnReachBottom = false;
    },

    // 事件
    wendaEvent(event) {
        let dataset = event.currentTarget.dataset;
        let list = this.data.list;
        if (dataset.types === 'tabType') { //类型筛选
            if (dataset.index == this.data.typeIndex) return;
            this.setData({
                typeIndex: dataset.index,
                list: []
            })

            wx.showLoading({
                title: '',
                mask: true
            })
            this.state.offset = 0;
            this.requestKnowList(0);
        } else if (dataset.types === 'tabStatus') { //状态筛选
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
            this.requestKnowList(0);
        } else if (dataset.types === 'seeImg') { //查看大图
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].qImg[idx].original_url, list[index].qImg, 2);
        } else if (dataset.types === 'detail') { //详情
            let index = dataset.index;
            wx.navigateTo({
                url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
            })
        }
    },



    // 获取问答列表
    requestKnowList(offset) {
        let that = this;
        let url = 'api/Answer/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            aid: 0,
            type: that.data.typeIndex
        }
        if (that.data.typeIndex == 1) {
            data.status = that.data.tabIndex;
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
                common.showClickMoal(res.msg);
            }
        });
    }
})