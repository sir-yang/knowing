let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();
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
        showMore: true,
        schoolList: [],
        schoolTab: 0, //顶部学校索引
        playing: false, //播放状态
        percent: 0,
        playAudioIdx: -1
    },

    state: {
        hasmore: true,
        offset: 0, //从第几条数据开始查询
        limit: 10, //每页条数
        pageOnShow: false,
        isOnReachBottom: true,
        isonPullDownRefresh: false,
        playId: 0 //播放ID
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
            common.requestGetCollege(that);
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestGetCate();
                that.requestGetList(0);
                common.requestGetCollege(that);
            };
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        let that = this;
        // 播放
        innerAudioContext.onPlay(() => {
            console.log('开始播放');
            that.setData({
                playing: true
            });
        })
        innerAudioContext.onPause((res) => {
            console.log('监听暂停', res);
            that.setData({
                playing: false
            });
        })

        innerAudioContext.onStop((res) => {
            console.log('监听停止', res);
            that.setData({
                playing: false,
                playAudioIdx: -1
            });
        })
        // 监听结束
        innerAudioContext.onEnded((res) => {
            console.log('监听结束', res);
            that.setData({
                playing: false,
                playAudioIdx: -1
            });
        })
        // 监听进度
        innerAudioContext.onTimeUpdate((res) => {
            let percent = parseInt((parseInt(innerAudioContext.currentTime) / parseInt(innerAudioContext.duration)) * 100);
            let currentTime = util.changeTimeFormat(parseInt(innerAudioContext.currentTime));
            that.setData({
                percent,
                currentTime
            })
        });
        innerAudioContext.onError((res) => {
            common.showClickModal(res.errMsg);
        })
    },

    onShow() {
        let that = this;
        that.getUserInfo();
        getApp().globalData.enjoyUpdateCallback = function (index) {
            that.requestGetDetail(index);
        };
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

    getUserInfo() {
        let that = this;
        common.getPersonInfo().then((res) => {
            that.setData({
                userInfo: res
            })
        })
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
            if (this.data.typeIndex == 1) {
                if (this.data.playing) { //当前有播放 停止播放
                    innerAudioContext.stop();
                    this.state.playId = 0;
                    this.setData({
                        playAudioIdx: -1,
                        playing: false,
                        typeIndex: dataset.index,
                        searchVal: '',
                        list: []
                    })
                } else {
                    this.setData({
                        typeIndex: dataset.index,
                        searchVal: '',
                        list: []
                    })
                }
            } else {
                this.setData({
                    typeIndex: dataset.index,
                    searchVal: '',
                    list: []
                })
            }
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'school') { //学校切换
            this.setData({
                schoolTab: event.detail.value
            })
        } else if (dataset.types === 'tab') { //分类切换
            if (dataset.index == this.data.tabIndex) return;
            if (this.data.typeIndex == 1) {
                if (this.data.playing) { //当前有播放 停止播放
                    innerAudioContext.stop();
                    this.state.playId = 0;
                    this.setData({
                        playAudioIdx: -1,
                        playing: false,
                        searchVal: '',
                        tabIndex: dataset.index,
                        list: []
                    })
                } else {
                    this.setData({
                        searchVal: '',
                        tabIndex: dataset.index,
                        list: []
                    })
                }
            } else {
                this.setData({
                    searchVal: '',
                    tabIndex: dataset.index,
                    list: []
                })
            }

            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'ipt') { //监听输入
            this.setData({
                searchVal: event.detail.value
            })
        } else if (dataset.types === 'search') { //搜索
            if (this.data.playing) { //当前有播放 停止播放
                this.state.playId = 0;
                this.setData({
                    playAudioIdx: -1,
                    playing: false,
                    list: []
                })
                innerAudioContext.stop();
            }
            this.state.offset = 0;
            this.requestGetList(0);
        } else if (dataset.types === 'message') { //消息
            wx.navigateTo({
                url: '/pages/message/message'
            })
        } else if (dataset.types === 'publish') { //发布
            wx.navigateTo({
                url: '/pages/publish/publish'
            })
        } else if (dataset.types === 'moreTab') { //更多分类
            this.setData({
                showMore: !this.data.showMore
            })
        } else if (dataset.types === 'seeImg') { //查看大图
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
        } else if (dataset.types === 'detail') { //详情
            let id = dataset.id;
            wx.navigateTo({
                url: '/pages/enjoyDetail/enjoyDetail?id=' + id + '&index=' + dataset.index
            })
        } else if (dataset.types === 'like') { //点赞
            let index = dataset.index;
            let userInfo = this.data.userInfo;
            wx.showLoading({
                title: '',
                mask: true
            })
            if (userInfo.id == list[index].uid) return;
            this.requestLike(list, index);
        } else if (dataset.types === 'report') { //举报
            let index = dataset.index;
            this.requestReport(list[index].id);
        } else if (dataset.types === 'play') { //语音播放
            let index = dataset.index;
            if (this.state.playId == list[index].id) { //
                if (this.data.playing) {
                    innerAudioContext.pause();
                } else {
                    innerAudioContext.play();
                }
            } else {
                innerAudioContext.src = list[index].audio;
                innerAudioContext.play();
                this.state.playId = list[index].id;
                this.setData({
                    playAudioIdx: index
                })
            }
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
        if (that.state.pageOnShow) {
            wx.showLoading({
                title: '',
                mask: true
            })
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
                common.showClickModal(res.msg);
            }
        })
    },

    // 获取详情 更新
    requestGetDetail(index) {
        let that = this;
        let list = that.data.list;
        let url = 'api/share/getPage';
        console.log(12,index);

        if (list[index]) {
            util.httpRequest(url, {
                id: list[index].id
            }).then((res) => {
                if (res.result === 'success') {
                    list[index].comments = res.results.comments;
                    list[index].likeNum = res.results.likeNum;
                    list[index].zan = res.results.zan;
                    that.setData({
                        list
                    })
                } else {
                    common.showClickModal(res.msg);
                }
            })
        }
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