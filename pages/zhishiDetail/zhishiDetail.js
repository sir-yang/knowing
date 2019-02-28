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
        list: [],
        posterTk: 'hide', //海报弹框
        posterUrl: '', //海报路径
        needAuth: true //保存图片授权
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
        this.getUserInfo();
        this.requestGetDetail(options);
    },

    getUserInfo() {
        let that = this;
        common.getPersonInfo().then((res) => {
            that.setData({
                userInfo: res
            })
        })
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
            this.requestAnswerList(0);
        } else {
            this.requestGetCourses(0);
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
            this.requestAnswerList(0);
        } else {
            this.requestGetCourses(0);
        }
        this.state.isOnReachBottom = false;
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
                this.requestAnswerList(0);
            } else {
                this.requestGetCourses(0);
            }
        } else if (dataset.types === 'attention') { //关注
            this.requestAttention();
        } else if (dataset.types === 'letters') { //私信
            if (Number(this.data.details.letter) === 0) {
                wx.navigateTo({
                    url: '/pages/privateMsgDetail/privateMsgDetail?uid=' + this.state.options.id
                })
            } else {
                common.showClickModal('关注知士后可发起私信');
            }
        } else if (dataset.types === 'showEvaluate') { //显示评价框
            if (Number(this.data.userInfo.id) === (this.data.details.id)) {
                common.showTimeToast('不能评论自己');
                return false;
            }
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
        } else if (dataset.types === 'wenda') { //问答详情
            let list = this.data.list;
            let index = dataset.index;

            if (list[index].around == 1) {
                wx.navigateTo({
                    url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
                })
            } else {
                let that = this;
                that.state.shareId = list[index].id;
                let itemList = ["免费围观"];
                if (list[index].aroundMoney > 0) {
                    itemList = ["分享围观", "付费围观"];
                }
                wx.showActionSheet({
                    itemList,
                    success(res) {
                        if (res.tapIndex == 0) {
                            if (list[index].aroundMoney > 0) {
                                that.getIsAuth();
                                that.requestPoster();
                            } else {
                                wx.showTabBar({});
                                that.requestPay(index);
                            }
                        } else {
                            wx.showTabBar({})
                            that.requestPay(index);
                        }
                    }
                })
            }
        } else if (dataset.types === 'seeImg') { //查看大图
            let list = this.data.list;
            let index = dataset.index;
            let idx = dataset.idx;
            if (this.data.tabIndex == 0) {
                common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
            } else {
                common.seeBigImg(list[index].qImg[idx].original_url, list[index].qImg, 2);
            }
        } else if (dataset.types === 'courses') {
            wx.navigateTo({
                url: '/pages/coursesDetail/coursesDetail?id=' + dataset.id
            })
        } else if (dataset.types === 'question') { //提问
            wx.navigateTo({
                url: '/pages/askQuestion/askQuestion'
            })
        } else if (dataset.types === 'like') { //点赞
            if (Number(this.data.userInfo.id) === (this.data.details.id)) {
                common.showTimeToast('不能给自己点赞');
                return false;
            }
            let list = this.data.list;
            let index = dataset.index;
            let data = {
                id: list[index].id,
                status: list[index].zan == 1 ? 1 : 2
            }
            wx.showLoading({
                title: '',
                mask: true
            })
            this.requestLike(list, index, data);
        } else if (dataset.types === 'zhixiang') { //知享详情
            let list = this.data.list;
            let index = dataset.index;
            wx.navigateTo({
                url: '/pages/enjoyDetail/enjoyDetail?id=' + list[index].id
            })
        } else if (dataset.types === 'savaImg') { //保存海报
            let that = this;
            wx.getImageInfo({
                src: that.data.posterUrl,
                success(res) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.path,
                        success() {
                            wx.showToast({
                                title: '保存成功',
                                icon: 'none',
                                success() {
                                    that.setData({
                                        posterTk: 'hide'
                                    })
                                }
                            })
                        }
                    })
                },
                fail(err) {
                    common.showClickModal(err.errMsg);
                }
            })
        } else if (dataset.types === 'fensi' || dataset.types === 'guanzhu') {
            let details = this.data.details;
            let status = 1;
            if (dataset.types === 'guanzhu') {
                status = 2;
            }
            wx.navigateTo({
                url: '/pages/attentionList/attentionList?uid=' + details.id + '&status=' + status
            })
        } else if (dataset.types === 'closePoster') { //关闭海报弹框
            this.setData({
                posterTk: 'hide'
            })
        }
    },

    // 授权判断
    getIsAuth() {
        let that = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success(suc) {
                            that.setData({
                                needAuth: false
                            })
                        },
                        fail() {
                            that.setData({
                                needAuth: true
                            })
                        }
                    })
                } else {
                    that.setData({
                        needAuth: false
                    })
                }
            }
        })
    },

    // 权限设置回调
    openSetBack(event) {
        if (event.detail.authSetting['scope.writePhotosAlbum']) {
            this.setData({
                needAuth: false
            })
        } else {
            this.setData({
                needAuth: true
            })
        }
    },

    // 获取海报
    requestPoster() {
        let that = this;
        let url = 'api/Share/share';
        wx.showLoading({
            title: '海报生成中...',
            mask: true
        })
        util.httpRequest(url, {
            id: that.state.shareId
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                // 隐藏底部导航 显示显示海报
                that.setData({
                    posterTk: 'show',
                    posterUrl: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 调用支付围观
    requestPay(index) {
        let that = this;
        let url = 'api/Answer/around';
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, {
            id: that.state.shareId
        }, 'POST').then((res) => {
            wx.hideLoading();
            console.log(res);
            if (res.result === 'success') {
                wx.hideLoading();
                if (res.results) {
                    common.requestPay(res.results, (status, res_1) => {
                        if (status == 'success') {
                            wx.showModal({
                                title: '提示',
                                content: '支付成功',
                                showCancel: false,
                                success() {
                                    wx.navigateTo({
                                        url: '/pages/wendaDetail/wendaDetail?id=' + that.state.shareId
                                    })
                                }
                            })
                        } else {
                            common.showClickModal('支付失败');
                        }
                    })
                } else {
                    let list = that.data.list;
                    if (list[index].status == 3 || list[index].status == 5) {
                        wx.navigateTo({
                            url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
                        })
                    } else if (list[index].status == 1) {
                        common.showClickModal('问题暂未回答');
                    }
                }
                
            } else {
                common.showClickModal(res.msg);
            }
        })
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
                if (res.results.status == 1 || res.results.status == 2) {
                    wx.setNavigationBarTitle({
                        title: '知了详情'
                    })
                }
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