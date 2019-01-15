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
        this.requestGetList(0);
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


    // 事件
    shareEvent(event) {
        let list = this.data.list;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'seeImg') {
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
        } else if (dataset.types === 'delete') {
            let index = dataset.index;
            wx.showLoading({
                title: '',
                mask: true
            })
            this.requestDelShare(index);
        }
    },


    // 分享列表
    requestGetList(offset) {
        let that = this;
        let url = 'api/share/getPage';
        let userInfo = common.getStorage('userInfo');
        let data = {
            offset,
            limit: that.state.limit,
            uid: userInfo.id
        }
        util.httpRequest(url, data).then((res) => {
            console.log(res);
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
    },

    // 删除分享
    requestDelShare(index) {
        let that = this;
        let list = that.data.list;
        let url = 'api/Share/del';
        util.httpRequest(url, {
            id: list[index].id
        }).then((res) => {
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

})