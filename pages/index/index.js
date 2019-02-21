let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        pageName: 'index',
        typeTab: 0,
        sortTab: 3,
        order: 1,
        posterTk: 'hide', //海报弹框
        posterUrl: '', //海报路径
        searchVal: '',
        typeTabArr: [],
        list: [],
        role: 1, //权限 默认普通用户
        needAuth: true, //保存图片授权
        schoolList: [], //学校
        schoolIdx: -1,
        schoolTab: 0, //顶部学校索引
        collegeList: [], //学院
        collegeIdx: -1,
        educationList: ["学士", "硕士", "博士", "其他"],
        educationIdx: -1,

        // 登录注册相关
        loginRegistTk: 'hide',
        showLogin: 'hide', //登录
        showRegist: 'hide', //注册
        showForget: 'hide', //忘记密码
        showPerfect: ['hide', 'hide', 'hide', 'hide'], //0:完善信息 1:学生 2:教师 3:其他
        identity: 1, //注册角色
        agree: false, //协议状态
        genderId: 1,
        CountdownVal: '发送验证码',
        CountdownTime: 60,
        onClick: true,
        clearTimeout: true,
        phoneVal: '',
        passwordVal: '',
        confirmVal: '',
        codeVal: '',
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
            that.userRole();
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.userRole();
            };
        }
    },

    onShow() {
        if (!this.state.pageOnShow) return;
        this.userRole();
    },


    onUnload() {
        this.setData({
            loginRegistTk: 'hide',
            showLogin: 'hide',
            showPerfect: ['hide', 'hide', 'hide', 'hide'],
            phoneVal: '',
            passwordVal: '',
            codeVal: ''
        })
    },

    // 用户权限判断
    userRole() {
        let that = this;
        common.getPersonInfo().then((userInfo) => {
            if (userInfo) {
                if (!userInfo.avatarUrl && !userInfo.nickName) {
                    wx.redirectTo({
                        url: '/pages/launch/launch'
                    })
                    return;
                }
                if (userInfo.statusId == 1) { //判断是否调用右上角消息通知
                    common.requestMessage(that);
                }
                let role = 2;
                if (userInfo.statusId == 0 || (userInfo.status != 5 && userInfo.status != 6 && userInfo.status != 8)) {
                    role = 1;
                }
                that.setData({
                    role
                })
                that.requestGetCate();
                common.requestGetCollege(that);
            } else {
                wx.redirectTo({
                    url: '/pages/launch/launch'
                })
            }
        })
    },

    // 界面显示执行
    indexShowLoad() {
        let that = this;
        common.getPersonInfo().then((userInfo) => {
            if (userInfo) {
                if (!userInfo.avatarUrl && !userInfo.nickName) {
                    wx.redirectTo({
                        url: '/pages/launch/launch'
                    })
                    return;
                }
                let role = 2;
                if (userInfo.status != 5 && userInfo.status != 6 && userInfo.status != 8) {
                    role = 1;
                }

                // 判断是否需要登录
                let loginRegistTk = that.data.loginRegistTk;
                let showLogin = that.data.showLogin;
                let showPerfect = that.data.showPerfect;

                if (userInfo.statusId == 0) { //未登录
                    loginRegistTk = 'show';
                    showLogin = 'show';
                    // 隐藏底部导航
                    if (wx.hideTabBar()) {
                        wx.hideTabBar({});
                    }
                    that.setData({
                        role,
                        loginRegistTk,
                        showLogin,
                        showPerfect
                    })
                    // 获取图片验证码
                    common.requestGetImgSend(that);
                } else if (!userInfo.name) {
                    // 隐藏底部导航
                    if (wx.hideTabBar()) {
                        wx.hideTabBar({});
                    }
                    loginRegistTk = 'show';
                    showPerfect[0] = 'show';
                    showPerfect[userInfo.type] = 'show';
                    that.setData({
                        role,
                        loginRegistTk,
                        showLogin,
                        showPerfect
                    })
                } else { //已登录 调用列表
                    wx.showLoading({
                        title: '加载中...',
                        mask: true
                    });
                    that.setData({
                        role
                    })
                    this.state.offset = 0;
                    that.requestList(0);
                }
            } else {
                wx.redirectTo({
                    url: '/pages/launch/launch'
                })
            }
        });
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
            if (dataset.index == that.data.typeTab) return;
            that.setData({
                searchVal: '',
                typeTab: dataset.index
            })
            this.state.offset = 0;
            this.requestList(0);
        } else if (dataset.types === 'school') { //学校切换
            that.setData({
                schoolTab: event.detail.value
            })
        } else if (dataset.types === 'ask') { //提问
            common.isLoginRegist(that, () => {
                wx.navigateTo({
                    url: '/pages/askQuestion/askQuestion'
                })
            });
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
            common.isLoginRegist(that, () => {
                let index = dataset.index;
                if (that.data.role == 2) return;
                if (list[index].around == 1) {
                    if (list[index].status == 3 || list[index].status == 5) {
                        wx.navigateTo({
                            url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
                        })
                    } else if (list[index].status == 1) {
                        common.showClickModal('问题暂未回答');
                    }
                } else {
                    that.state.shareId = list[index].id;
                    let itemList = ["分享围观", "免费围观"];
                    if (item.aroundMoney > 0) {
                        itemList = ["分享围观", "付费围观"];
                    }
                    wx.showActionSheet({
                        itemList,
                        success(res) {
                            if (res.tapIndex == 0) {
                                that.getIsAuth();
                                that.requestPoster();
                            } else {
                                wx.showTabBar({})
                                if (item.aroundMoney > 0) {
                                    that.requestPay();
                                } else {
                                    if (list[index].status == 3 || list[index].status == 5) {
                                        wx.navigateTo({
                                            url: '/pages/wendaDetail/wendaDetail?id=' + list[index].id
                                        })
                                    } else if (list[index].status == 1) {
                                        common.showClickModal('问题暂未回答');
                                    }
                                }
                            }
                        }
                    })
                }
            });
        } else if (dataset.types === 'reply') { //去回答
            common.isLoginRegist(that, () => {
                let index = dataset.index;
                if (list[index].status == 1) {
                    wx.showModal({
                        title: '提示',
                        content: "确定回答",
                        showCancel: true,
                        success(_res) {
                            console.log(_res)
                            if (_res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/reply/reply?id=' + list[index].id
                                })
                            }
                        }
                    });
                } else if (list[index].status == 2) {
                    common.showClickModal('问题已被他人锁定');
                } else {
                    common.showClickModal('问题已被他人回答');
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
            // if (that.data.searchVal == "") {
            //     common.showTimeToast('请输入搜索关键词');
            //     return;
            // }
            that.state.offset = 0;
            that.requestList(0);
        } else if (dataset.types === 'message') { //消息
            common.isLoginRegist(that, () => {
                wx.navigateTo({
                    url: '/pages/message/message'
                })
            });
        } else if (dataset.types === 'savaImg') { //保存海报
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
                that.state.offset = 0;
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
        if (typeTabArr.length == 0) {
            common.showClickModal('请先添加问答分类');
            return false;
        }

        let url = 'api/Answer/getPage';
        let data = {
            offset,
            limit: that.state.limit,
            type: typeTabArr[that.data.typeTab].id,
            status: that.data.sortTab
        }
        if (that.data.role == 2) {
            data.answer = 1;
        }
        // data.answer = that.data.role == 1 ? 1 : 2;
        if (that.data.searchVal != '') {
            data.key = that.data.searchVal;
        }
        if (that.data.order == 1) {
            data.order = 1;
        }
        // if (that.data.sortTab != 0) {
        //     data.status = that.data.sortTab;
        //     if (that.data.order == 1) {
        //         data.order = 1;
        //     }
        // }
        if (that.state.pageOnShow) {
            wx.showLoading({
                title: '',
                mask: true
            });
        }

        util.httpRequest(url, data).then((res) => {
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
                wx.showTabBar({
                    success() {
                        that.setData({
                            posterTk: 'show',
                            posterUrl: res.results
                        })
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 调用支付围观
    requestPay() {
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
                common.showClickModal(res.msg);
            }
        })
    }
})