let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

const recorderManager = wx.getRecorderManager()

const options = {
    duration: 60000,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'aac',
    frameSize: 50
}

const innerAudioContext = wx.createInnerAudioContext()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        aAudio: '',
        imgList: [],
        contentVal: '',
        moneyData: [],
        moneyVal: '',
        moneyIndex: -1,
        needAuth: true,
        playing: false, //播放状态
        status: false, //录音状态
        percent: 0,
        currentTime: '00:00'
    },

    state: {
        audio: '',
        audio_duration: 0,
        imgArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 调用锁定问题
        // this.requestAnswerLock(options);
        
        if (!(wx.createInnerAudioContext())) {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            });
        }

        let that = this;
        let token = common.getAccessToken();
        if (token) {
            // 获取提问金额
            common.requestGetMoney(that);
        } else {
            getApp().globalData.tokenUpdated = function() {
                console.log('update success');
                // 获取提问金额
                common.requestGetMoney(that);
            };
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        let that = this;
        recorderManager.onStart(() => {
            let aAudio = that.data.aAudio;
            let playing = that.data.playing;
            if (aAudio) { //重新录音
                if (playing) { //若在播放，则停止播放
                    innerAudioContext.stop();
                }
                aAudio = '';
                playing = false;
            }
            that.setData({
                status: true,
                aAudio,
                playing
            });
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res)
            that.state.audio = res.tempFilePath;
            that.state.audio_duration = parseInt(res.duration / 1000);
            let duration = util.changeTimeFormat(parseInt(res.duration/1000));
            that.setData({
                status: false,
                aAudio: res.tempFilePath,
                duration
            });
        })
        recorderManager.onFrameRecorded((res) => {
            const {
                frameBuffer
            } = res;
            console.log('frameBuffer.byteLength', frameBuffer.byteLength)
        })

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
            let duration = that.data.duration;
            let percent = parseInt((parseInt(innerAudioContext.currentTime) / that.state.audio_duration) * 100);
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
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.record']) {
                    wx.authorize({
                        scope: 'scope.record',
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

    // 事件
    replyEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'upload') {
            let imgList = [];
            let imgListArr = [];
            common.uploadImg(9, (photoUrl, tempFilePaths) => {
                tempFilePaths.forEach((url) => {
                    imgList.push(url);
                });

                photoUrl.forEach((obj) => {
                    //console.log(JSON.parse(obj.data).url);
                    let img = {
                        oss_object: JSON.parse(obj.data).url
                    };
                    imgListArr.push(img);
                });

                that.state.imgArr = imgListArr;
                that.setData({
                    imgList
                });
            });
        } else if (dataset.types === 'removeImg') {
            let imgList = that.data.imgList;
            let imgArr = that.state.imgArr;
            let index = dataset.index;
            imgList = imgList.splice(index, 1);
            imgArr = imgArr.splice(index, 1);
            that.state.imgArr = imgArr;
            that.setData({
                imgList
            })
        } else if (dataset.types === 'content') {
            that.setData({
                contentVal: event.detail.value
            })
        } else if (dataset.types === 'money') {
            if (dataset.index == that.data.moneyIndex) return;
            that.setData({
                moneyIndex: dataset.index,
                moneyVal: ''
            })
        } else if (dataset.types === 'temporary') { //暂存
            let data = that.getSubmitVal();
            if (data) common.setStorage('answerData', data);
        } else if (dataset.types === 'submit') { //提交
            let vals = that.getSubmitVal();
            vals.wx_form_id = event.detail.formId;
            this.requestSubmit(vals);
        } else if (dataset.types === 'moneyIpt') { //监听输入金额
            that.setData({
                moneyVal: event.detail.value
            })
        } else if (dataset.types === 'recorder') { //开始/停止录音
            if (that.data.status) { //停止录音
                recorderManager.stop();
            } else { //开始录音
                if (that.data.aAudio) {
                    let content = '已有录音，是否重新录音？';
                    if (that.data.playing) {
                        content = '录音正在播放，是否停止播放？';
                    }
                    wx.showModal({
                        title: '提示',
                        content,
                        cancelText: '否',
                        confirmText: '是',
                        success(res) {
                            if (res.confirm) {
                                if (that.data.playing) {//停止播放录音
                                    innerAudioContext.stop();
                                } else {
                                    recorderManager.start(options);
                                }
                            }
                        }
                    })
                } else {
                    recorderManager.start(options);
                }
            }
        } else if (dataset.types === 'play') { //播放/暂停录音
            if (that.data.status) {
                wx.showModal({
                    title: '提示',
                    content: '正在录音，是否停止录音？',
                    cancelText: '否',
                    confirmText: '是',
                    success(res) {
                        if (res.confirm) {
                            recorderManager.stop();
                        }
                    }
                })
            } else {
                if (that.data.playing) {
                    innerAudioContext.pause();
                } else {
                    innerAudioContext.src = that.data.aAudio;
                    innerAudioContext.play();
                }
            }
        } else if (dataset.types === 'delAudio') { //删除录音
            wx.showModal({
                title: '提示',
                content: '是否确认删除语音？',
                cancelText: '否',
                confirmText: '是',
                success(res) {
                    if (res.confirm) {
                        that.setData({
                            aAudio: ''
                        })
                    }
                }
            })
        }
    },

    // 权限设置回调
    openSetBack(event) {
        if (event.detail.authSetting['scope.record']) {
            this.setData({
                needAuth: false
            })
        } else {
            this.setData({
                needAuth: true
            })
        }
    },

    // 其他金额获取焦点
    focusIpt() {
        this.setData({
            moneyIndex: -1
        })
    },

    // 获取数据
    getSubmitVal() {
        let that = this;
        let data = {};
        if (that.data.contentVal == '') {
            common.showTimeToast('请填写回答内容');
            return;
        }
        data.answer = that.data.contentVal;

        if (that.state.imgArr.length > 0) {
            data.aImg = that.state.imgArr;
        }

        if (that.data.moneyIndex != -1) {
            let moneyData = that.data.moneyData;
            data.aroundMoney = moneyData[that.data.moneyIndex];
        } else {
            if (that.data.moneyVal == '') {
                common.showTimeToast('请选择围观金额');
                return;
            }
            data.aroundMoney = that.data.moneyVal;
        }
        return data;
    },

    // 问题锁定
    requestAnswerLock(opt) {
        let that = this;
        let url = 'api/Answer/edits';
        let data = {
            id: opt.id
        }
        util.httpRequest(url, data).then((res) => {
            common.showClickModal(res.msg)
        });
    },

    // 提交
    requestSubmit(vals) {
        let that = this;
        let url = 'api/Answer/save';
        util.httpRequest(url, vals, 'POST').then((res) => {
            if (res.result === 'success') {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success() {
                        wx.navigateBack({});
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})