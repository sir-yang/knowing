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
        grade: 0,
        starImg: [
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
            "/images/star_icon.png",
        ],
        list: []
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
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.requestGetDetail(options);
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestGetDetail(options);
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
        if (this.data.tabIndex == 0) {
            this.requestGetShareList(0);
        } else if (this.data.tabIndex == 1) {
            this.requestGetCourses(0);
        } else {
            this.requestAnswerList(0);
        }
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
        if (this.data.tabIndex == 0) {
            this.requestGetShareList(0);
        } else if (this.data.tabIndex == 1) {
            this.requestGetCourses(0);
        } else {
            this.requestAnswerList(0);
        }
        this.state.isOnReachBottom = false;
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
                tabIndex: dataset.index,
                list: []
            })
            wx.showLoading({
                title: '',
                mask: true
            })
            this.state.offset = 0;
            if (dataset.index == 0) {
                this.requestGetShareList(0);
            } else if (dataset.index == 1) {
                this.requestGetCourses(0);
            } else {
                this.requestAnswerList(0);
            }
        } else if (dataset.types === 'attention') { //关注
            this.requestAttention();
        } else if (dataset.types === 'letters') { //私信

        } else if (dataset.types === 'showEvaluate') { //显示评价框
            let details = this.data.details;
            if (details.valuation == 0) return;
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
                grade: Number(index) + 1,
                starImg
            })
        } else if (dataset.types === 'evaluate') { //评价
            let grade = this.data.grade;
            if (grade == 0) {
                common.showTimeToast('请先打星哟');
                return false;
            }
            wx.showLoading({
                title: '',
                mask: true
            })
            // 调用评分
            this.requestValuation();
        } else if (dataset.types === 'wendaDetail') { //问答详情
            let list = this.data.list;
            let index = dataset.index;
            wx.navigateTo({
                url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
            })
        } else if (dataset.types === 'seeImg') { //查看大图
            let list = this.data.list;
            let index = dataset.index;
            let idx = dataset.idx;
            if (this.data.tabIndex == 0) {
                common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
            } else {
                common.seeBigImg(list[index].qImg[idx].original_url, list[index].qImg, 2);
            }
        } else if (dataset.types === 'question') { //提问
            wx.navigateTo({
                url: '/pages/askQuestion/askQuestion'
            })
        } else if (dataset.types === 'like') { //点赞
            let list = this.data.list;
            let index = dataset.index;
            let data = {
                id: this.state.options.id,
                status: list[index].zan == 1 ? 1 : 2
            }
            wx.showLoading({
                title: '',
                mask: true
            })
            this.requestLike(list, index, data);
        } else if (dataset.types === 'detail') { //回答详情
            let list = this.data.list;
            let index = dataset.index;
            wx.navigateTo({
                url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
            })
        }
    },


    // 获取知士详情
    requestGetDetail(opt) {
        let that = this;
        let url = 'api/User/getPage';
        util.httpRequest(url, {
            id: opt.id
        }).then((res) => {
            // wx.hideLoading();
            that.requestGetShareList(0);
            if (res.result === 'success') {
                that.setData({
                    requestStatus: true,
                    details: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 分享列表
    requestGetShareList(offset) {
        let that = this;
        let url = 'api/share/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            uid: that.state.options.id,
            status: 2
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 课程列表
    requestGetCourses(offset) {
        let that = this;
        let url = 'api/Courses/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            uid: that.state.options.id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 回答列表
    requestAnswerList(offset) {
        let that = this;
        let url = 'api/Answer/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            aid: that.state.options.id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 关注 取消关注
    requestAttention() {
        let that = this;
        let url = 'api/SelfCenter/attention';
        let details = that.data.details;
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, {
            id: that.state.options.id,
            status: details.attention == 1 ? 1 : 2
        }).then((res) => {
            wx.hideLoading();
            common.showTimeToast(res.msg);
            if (res.result === 'success') {
                let details = that.data.details;
                if (details.attention == 1) {
                    details.attention = 0;
                    details.fansNum = Number(details.fansNum) + 1;
                } else {
                    details.attention = 1;
                    details.fansNum = Number(details.fansNum) - 1
                }
                that.setData({
                    details
                })
            }
        })
    },

    // 评分
    requestValuation() {
        let that = this;
        let url = 'api/Valuation/set';
        let data = {
            type: 2,
            grade: that.data.grade,
            objId: that.state.options.id
        }
        util.httpRequest(url, data, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let details = that.data.details;
                details.score = res.results;
                details.valuation = 0;
                that.setData({
                    evaluationTk: 'hide',
                    details
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 点赞
    requestLike(list, index, vals) {
        let that = this;
        let url = 'api/Share/zan';
        util.httpRequest(url, vals).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (list[index].zan == 1) {
                    list[index].zan = 0;
                    list[index].likeNum = Number(list[index].likeNum) + 1;
                } else {
                    list[index].zan = 1;
                    list[index].likeNum = Number(list[index].likeNum) - 1;
                }
                that.setData({
                    list
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})