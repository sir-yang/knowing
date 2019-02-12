let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
let WxParse = require('../../wxParse/wxParse.js');

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
        duration: '00:00'
    },

    state: {
        audio_duration: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.requestCoursesDetail(options);
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                that.requestCoursesDetail(options);
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

    // 事件
    detailEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'play') { //播放/暂停音频
            if (this.data.playing) {
                innerAudioContext.pause();
            } else {
                innerAudioContext.play();
            }
        }
    },

    // 调用课程详情
    requestCoursesDetail(opt) {
        let that = this;
        let url = 'api/Courses/getPage';
        util.httpRequest(url, {
            id: opt.id
        }).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (res.results.audio) {
                    innerAudioContext.src = res.results.audio;
                }
                that.setData({
                    requestStatus: true,
                    details: res.results,
                    duration: res.results.audio_times
                })
                setTimeout(() => {
                    if (res.results.info) {
                        let wxData = WxParse.wxParse('article', 'html', res.results.info, that, 5);
                        that.setData(wxData);
                    }
                }, 200)
            } else {
                common.showClickModal(res, msg);
            }
        })
    }
})