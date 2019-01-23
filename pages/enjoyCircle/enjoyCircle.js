let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        searchVal: '',
        typeIndex: 2,
        typeTabArr: [],
        tabIndex: -1,
        list: [],
        showMore: true
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
            that.requestGetCate();
            that.requestGetList(0);
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestGetCate();
                that.requestGetList(0);
            };
        }
        let userInfo = common.getStorage('userInfo');
        that.setData({
            userInfo
        })
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 事件
    enjoyEvent(event) {
        let dataset = event.currentTarget.dataset;
        let list = this.data.list;
        if (dataset.types === 'types') {
            if (dataset.index == this.data.typeIndex) return;
            this.setData({
                typeIndex: dataset.index
            })
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'tab') {
            if (dataset.index == this.data.tabIndex) return;
            this.setData({
                searchVal: '',
                tabIndex: dataset.index,
                list: []
            })
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'ipt') {
            this.setData({
                searchVal: event.detail.value
            })
        } else if (dataset.types === 'search') {
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'message') {
            wx.navigateTo({
                url: '/pages/message/message'
            })
        } else if (dataset.types === 'publish') {
            wx.navigateTo({
                url: '/pages/publish/publish'
            })
        } else if (dataset.types === 'moreTab') {
            this.setData({
                showMore: !this.data.showMore
            })
        } else if (dataset.types === 'seeImg') {
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
        } else if (dataset.types === 'detail') {
            let id = dataset.id;
            wx.navigateTo({
                url: '/pages/enjoyDetail/enjoyDetail?id=' + id
            })
        } else if (dataset.types === 'like') {
            let index = dataset.index;
            wx.showLoading({
                title: '',
                mask: true
            })
            this.requestLike(list, index);
        } else if (dataset.types === 'report') {
            let index = dataset.index;
            this.requestReport(list[index].id);
        }
    },

    // 调用分类接口
    requestGetCate() {
        let that = this;
        let data = {
            type: 2
        }
        common.requestCate(data, (res) => {
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 知享圈列表
    requestGetList(offset) {
        let that = this;
        let url = 'api/share/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            status: that.data.typeIndex
        }

        if (that.data.searchVal != '') {
            data.key = that.data.searchVal;
        }

        if (that.data.tabIndex != -1) {
            let typeTabArr = that.data.typeTabArr;
            data.type = typeTabArr[that.data.tabIndex].id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                handle.list.forEach((item) => {
                    if (item.content && item.content.length > 49) {
                        item.str = common.stringObject(item.content, 49);
                    }
                    if (item.audio) {
                        item.playing = false; //播放状态
                        item.percent = 0;
                        item.currentTime = '00:00';
                    }
                })
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.mmsg);
            }
        })
    },

    // 点赞/取消点赞
    requestLike(list, index) {
        let that = this;
        let url = 'api/Share/zan';
        let data = {
            id: list[index].id,
            status: list[index].zan == 1 ? 1 : 2
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (list[index].zan == 1) {
                    list[index].likeNum = Number(list[index].likeNum) + 1;
                    list[index].zan = 0;
                } else {
                    list[index].likeNum = Number(list[index].likeNum) - 1;
                    list[index].zan = 1;
                }
                that.setData({
                    list
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },


    // 举报
    requestReport(id) {
        let that = this;
        let url = 'api/user/report';
        let data = {
            objId: id,
            message: ''
        }
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, data, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {

            } else { 
                common.showClickModal(res.msg);
            }
        })
    }
})