let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        details: '',
        playing: false, //播放状态
        percent: 0,
        currentTime: '00:00',
        contentVal: '',
        iptFocus: false
    },

    state: {
        options: {},
        pid: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        that.state.options = options;
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })

        let token = common.getAccessToken();
        if (token) {
            that.requestGetDetail();
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                that.requestGetDetail();
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
                playing: false
            });
        })
        // 监听结束
        innerAudioContext.onEnded((res) => {
            console.log('监听结束', res);
            that.setData({
                playing: false
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 事件
    detailEvent(event) {
        let dataset = event.currentTarget.dataset;
        let details = this.data.details;
        if (dataset.types === 'seeImg') { //查看大图
            let index = dataset.index;
            common.seeBigImg(details.img[index].original_url, details.img, 2);
        } else if (dataset.types === 'play') { //播放/暂停音频
            if (this.data.playing) {
                innerAudioContext.pause();
            } else {
                innerAudioContext.play();
            }
        } else if (dataset.types === 'like') {
            let userInfo = common.getStorage('userInfo');
            if (userInfo.id == this.data.details.uid) return;
            wx.showLoading({
                title: '',
                mask: true
            })
            this.requestLike();
        } else if (dataset.types === 'reply') { //回复
            let that = this;
            let userInfo = common.getStorage('userInfo');
            let itemList = ["回复", "删除"];
            if (userInfo.id != details.user.id) {
                if (userInfo.id == dataset.uid) {
                    itemList = ["删除"];
                } else {
                    itemList = ["回复"];
                }
            }

            wx.showActionSheet({
                itemList,
                success(res) {
                    console.log(res.tapIndex);
                    if (res.tapIndex == 0) {
                        if (userInfo.id != details.user.id) {
                            if (userInfo.id == dataset.uid) {
                                // 删除评论
                                that.requestDelComment(dataset);
                            } else {
                                that.state.pid = dataset.pid;
                                that.setData({
                                    iptFocus: true
                                })
                            }
                        } else {
                            that.state.pid = dataset.pid;
                            that.setData({
                                iptFocus: true
                            })
                        }                        
                    } else {
                        // 删除评论
                        that.requestDelComment(dataset);
                    }
                }
            })
        } else if (dataset.types === 'ipt') {
            console.log(event);
            this.setData({
                contentVal: event.detail.value
            })
        } else if (dataset.types === 'submit') {
            if (common.isNull(this.data.contentVal)) {
                common.showTimeToast('请输入评论内容');
                return false;
            }
            this.requestSubmitComment();
        }
    },

    // 调用知享详情
    requestGetDetail() {
        let that = this;
        let url = 'api/share/getPage';
        util.httpRequest(url, {
            id: that.state.options.id
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (res.results.audio) {
                    innerAudioContext.src = res.results.audio;
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

    // 点赞/取消点赞
    requestLike() {
        let that = this;
        let url = 'api/Share/zan';
        let details = that.data.details;
        let data = {
            id: details.id,
            status: details.zan == 1 ? 1 : 2
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (details.zan == 1) {
                    details.likeNum = Number(details.likeNum) + 1;
                    details.zan = 0;
                } else {
                    details.likeNum = Number(details.likeNum) - 1;
                    details.zan = 1;
                }
                that.setData({
                    details
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 发布评论
    requestSubmitComment(dataset) {
        let that = this;
        let url = 'api/Comment/save';
        let data = {
            objId: that.state.options.id,
            content: that.data.contentVal
        }
        // 回复需传
        if (that.state.pid) {
            data.pid = that.state.pid;
        }
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, data, 'POST').then((res) => {
            if (res.result === 'success') {
                that.state.pid = '';
                that.setData({
                    contentVal: ''
                })
                that.requestGetDetail();
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 删除评论
    requestDelComment(dataset) {
        let that = this;
        let id = dataset.pid;
        let url = 'api/Comment/del';
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, {
            id
        }).then((res) => {
            if (res.result === 'success') {
                that.requestGetDetail();
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})