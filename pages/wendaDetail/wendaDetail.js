let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        details: '',
        playing: false, //播放状态
        percent: 0,
        currentTime: '00:00'
    },

    state: {
        options: {}
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
     * 放弃回答
     */
    btn1() {
        let url = "api/answer/refuse";
        wx.showLoading({
            title: '',
            mask: true
        })
        let val = {
            id: this.data.details.id
        }
        util.httpRequest(url, val, "POST").then((res) => {
            wx.hideLoading();
            if (res.result === "success") {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success(_res) {
                        wx.switchTab({
                            url: '/pages/index/index',
                        })
                    }
                });
            } else {
                common.showClickModal(res.msg)
            }
        })
    },

    /**
     * 继续回答
     */
    btn2() {
        wx.navigateBack({})
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

    // 事件
    detailEvent(event) {
        let dataset = event.currentTarget.dataset;
        let details = this.data.details;
        if (dataset.types === 'seeImg') { //查看大图
            let index = dataset.index;
            common.seeBigImg(details.qImg[index].original_url, details.qImg, 2);
        } else if (dataset.types === 'play') { //播放/暂停音频
            if (this.data.playing) {
                innerAudioContext.pause();
            } else {
                innerAudioContext.play();
            }
        }
    },

    // 调用问答详情
    requestGetDetail() {
        let that = this;
        let url = 'api/Answer/getPage';
        util.httpRequest(url, {
            id: that.state.options.id
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (res.results.aAudio) {
                    innerAudioContext.src = res.results.aAudio;
                }
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