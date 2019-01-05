let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        typeTab: 0,
        sortTab: 0,
        onlookersTk: 'hide', // 围观弹框
        posterTk: 'hide', //海报弹框
        searchVal: '',
        typeTabArr: [],
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
            title: '加载中',
            mask: true
        });
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.requestGetCate();
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestGetCate();
            };
        }
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
        this.state.isonPullDownRefresh = true;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.state.offset = 0;
        this.state.hasmore = true;
        this.requestList(0);
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
        this.requestList(this.state.offset);
        this.state.isOnReachBottom = false;
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
            this.state.offset = 0;
            this.requestList(0);
        } else if (dataset.types === 'ask') { //提问
            wx.navigateTo({
                url: '/pages/askQuestion/askQuestion'
            })
        } else if (dataset.types === 'sortTab') { //升降序
            that.setData({
                sortTab: dataset.index
            })
        } else if (dataset.types === 'detail') { //详情
            wx.hideTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'show'
                    })
                }
            });
        } else if (dataset.types === 'onlookers') { //围观弹框
            wx.showActionSheet({
                itemList: ["分享围观", "一元围观"],
                success(res) {
                    console.log(res.tapIndex);
                }
            })
        } else if (dataset.types === 'closeTk') { //关闭围观弹框
            wx.showTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'hide'
                    })
                }
            })
        } else if (dataset.types === 'seeImg') { //查看大图
            let list = that.data.list;
            let index = dataset.index;
            // common.seeBigImg(imgUrl, imgList);
        } else if (dataset.types === 'ipt') {
            that.setData({
                searchVal: event.detail.value
            })
        } else if (dataset.types === 'search') { //搜索

        }
    },


    // ==============  接口调用  ============ //

    // 类别
    requestGetCate() {
        let that = this;
        common.requestCate((res) => {
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })
                that.requestList(0);
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 获取问答列表
    requestList(offset) {
        let that = this;
        let typeTabArr = that.data.typeTabArr;
        let userInfo = common.getStorage('userInfo');
        let url = 'api/Answer/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            type: typeTabArr[that.data.typeTab].id
        }
        if (userInfo) {
            if (userInfo.status != 5 && userInfo.status != 6 && userInfo.status != 8) {
                data.answer = 1;
            }
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