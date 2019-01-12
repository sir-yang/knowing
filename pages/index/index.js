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
        order: 1,
        onlookersTk: 'hide', // 围观弹框
        posterTk: 'hide', //海报弹框
        searchVal: '',
        typeTabArr: [],
        list: [],
        role: 1, //权限 默认普通用户
        needAuth: true,
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

        //登录注册 数据
        let that = this;
        common.loginRegistData(that);
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
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let userInfo = common.getStorage('userInfo');
        if (userInfo) {
            let role = 2;
            if (userInfo.status != 5 && userInfo.status != 6 && userInfo.status != 8) {
                role = 1;
            }
            // 判断是否需要登录
            let loginRegistTk = this.data.loginRegistTk;
            let showLogin = this.data.showLogin;
            // if (!userInfo.name) {
            //     loginRegistTk = 'show';
            //     showLogin = 'show';
            //     // 隐藏底部导航
            //     if(wx.hideTabBar()) {
            //         wx.hideTabBar({});
            //     }
            //     // 获取图片验证码
            //     common.requestGetImgSend(this);
            // }
            this.setData({
                role,
                loginRegistTk,
                showLogin
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
        let list = that.data.list;
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
            let order = that.data.order;
            if (that.data.sortTab == dataset.index) {
                order = order == 1 ? 0 : 1;
            } else {
                order = 1;
            }
            that.setData({
                sortTab: dataset.index,
                order
            })

            that.state.offset = 0;
            that.requestList(0);
        } else if (dataset.types === 'detail') { //详情
            let index = dataset.index;
            if (list[index].around == 1) {
                wx.navigateTo({
                    url: '/pages/wendaDetail/wendaDetail?id='+ list[index].id
                })
            } else {
                wx.hideTabBar({
                    success() {
                        that.setData({
                            onlookersTk: 'show'
                        })
                    }
                });
            }
        } else if (dataset.types === 'onlookers') { //围观弹框
            wx.showActionSheet({
                itemList: ["分享围观", "付费围观"],
                success(res) {
                    console.log(res.tapIndex);
                }
            })
        } else if (dataset.types === 'reply') {//去回答
            let index = dataset.index;
            wx.navigateTo({
                url: '/pages/reply/reply?id=' + list[index].id
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
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].qImg[idx].original_url, list[index].qImg, 2);
        } else if (dataset.types === 'ipt') {
            that.setData({
                searchVal: event.detail.value
            })
        } else if (dataset.types === 'search') { //搜索
            if (that.data.searchVal == "") {
                common.showTimeToast('请输入搜索关键词');
                return;
            }
            that.state.offset = 0;
            that.requestList(0);
        } else if (dataset.types === 'share') { //分享海报
            // 授权判断
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
            // 隐藏底部导航 显示显示海报
            wx.showTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'hide',
                        posterTk: 'show'
                    })
                }
            })
        } else if (dataset.types === 'pay') { //付费
            wx.showTabBar({
                success() {
                    that.setData({
                        onlookersTk: 'hide'
                    })
                }
            })
        } else if (dataset.types === 'savaImg') { //保存海报
            wx.saveImageToPhotosAlbum({
                filePath: '',
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
        }
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


    // ==============  登录 注册  ============ //
    loginRegistEvent(event) {
        common.loginRegistEvent(event, this);
    },


    // ==============  接口调用  ============ //

    // 类别
    requestGetCate() {
        let that = this;
        let data = {
            type: 1
        }
        common.requestCate(data, (res) => {
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
        data.answer = that.data.role == 1 ? 1 : 2;
        if (that.data.searchVal != '') {
            data.key = that.data.searchVal;
        }
        if (that.data.sortTab != 0) {
            data.status = that.data.sortTab;
            if (that.data.order == 1) {
                data.order = 1;
            }
        }

        if (that.state.pageOnShow) {
            wx.showLoading({
                title: '加载中...',
                mask: true
            });
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
    },

    // 获取海报
    requestPoster() {
        let that = this;
        let url = '';
        util.httpRequest(url).then((res) => {
            if (res.result === 'success') {

            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 调用支付
    requestPay() {
        let that = this;
        let url = '';
        util.httpRequest(url, data, 'POST').then((res) => {
            console.log(res);
        })
    }
})