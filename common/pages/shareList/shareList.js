let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        list: [],
        playing: false, //播放状态
        percent: 0,
        playAudioIdx: -1,
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
        })
        this.requestGetList(0);
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
            that.setData({
                playing: false,
                playAudioIdx: -1
            });
        })
    },

    onShow() {
        let that = this;
        getApp().globalData.enjoyUpdateCallback = function(index) {
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
        if (dataset.types === 'detail') {
            let index = dataset.index;
            wx.navigateTo({
                url: '/enjoy/pages/enjoyDetail/enjoyDetail?id=' + list[index].id + '&index=' + index
            })
        } else if (dataset.types === 'seeImg') {
            let index = dataset.index;
            let idx = dataset.idx;
            common.seeBigImg(list[index].img[idx].original_url, list[index].img, 2);
        } else if (dataset.types === 'delete') {
            let index = dataset.index;
            let that = this;
            wx.showModal({
                title: '提示',
                content: '确认删除？',
                success(res) {
                    if (res.confirm) {
                        wx.showLoading({
                            title: '',
                            mask: true
                        })
                        that.requestDelShare(index);
                    }
                }
            })
        } else if (dataset.types === 'play') { //语音播放
            let that = this;
            let index = dataset.index;
            if (that.state.playId == list[index].id) { //
                if (that.data.playing) {
                    innerAudioContext.pause();
                } else {
                    innerAudioContext.play();
                }
            } else {
                innerAudioContext.src = list[index].audio;
                innerAudioContext.play();
                that.state.playId = list[index].id;
                that.setData({
                    playAudioIdx: index
                })
            }
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

    // 获取详情 更新
    requestGetDetail(index) {
        let that = this;
        let list = that.data.list;
        let url = 'api/share/getPage';

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
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    mask: true,
                    success() {
                        list.splice(index, 1);
                        that.setData({
                            list
                        })
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})