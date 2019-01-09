let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        tabIndex: 0,
        evaluationTk: 'hide', //评价弹框
        starImg: [
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.requestGetDetail(options);
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

    // 事件
    detailEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if (dataset.index == this.data.tabIndex) return;
            this.setData({
                tabIndex: dataset.index
            })
        } else if (dataset.types === 'attention') { //关注
            common.showTimeToast('关注成功');

        } else if (dataset.types === 'letters') { //私信

        } else if (dataset.types === 'showEvaluate') { //显示评价框
            this.setData({
                evaluationTk: 'show'
            })
        } else if (dataset.types === 'star') { //评价打星
            let starImg = this.data.starImg;
            let index = dataset.index;
            for (let i = 0; i < starImg.length; i += 1) {
                if (index >= i) {
                    starImg[i] = '/images/score_icon.png';
                } else {
                    starImg[i] = '/images/star_icon.png';
                }
            }
            this.setData({
                starImg
            })
        } else if (dataset.types === 'evaluate') { //评价
            this.setData({
                evaluationTk: 'hide'
            })
        } else if (dataset.types === 'seeImg') { //查看大图

        } else if (dataset.types === 'question') { //提问
            wx.navigateTo({
                url: '/pages/askQuestion/askQuestion'
            })
        } else if (dataset.types === 'like') { //点赞

        }
    },


    // 获取知士详情
    requestGetDetail(opt) {
        let that = this;
        let url = 'api/User/getPage';
        util.httpRequest(url, {
            id: opt.id
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                that.setData({
                    requestStatus: true,
                    details: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})