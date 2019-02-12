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
        requestStatus: false,
        typeTabArr: [],
        tabIndex: 0,
        aAudio: '',
        imgList: [],
        contentVal: '',
        needAuth: true,
        playing: false, //播放状态
        status: false, //录音状态
        percent: 0,
        currentTime: '00:00',
        tutorTk: 'hide', //导师选择弹框
        checkList: [{
                id: 1,
                value: "导师1"
            },
            {
                id: 2,
                value: "导师2"
            },
            {
                id: 3,
                value: "导师3"
            },
            {
                id: 4,
                value: "导师4"
            },
            {
                id: 5,
                value: "导师5"
            },
        ]
    },

    state: {
        audio_duration: 0,
        imgArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (!(wx.createInnerAudioContext())) {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            });
        }

        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestGetCate();
        
        let userInfo = common.getStorage('userInfo');
        this.setData({
            userInfo
        })
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
            wx.showToast({
                title: '录音中',
                image: '/images/recording_icon_1.png',
                duration: 10000000
            })
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
            let duration = util.changeTimeFormat(parseInt(res.duration / 1000));
            wx.hideToast();
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

    // 事件
    publishEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if (that.data.status) return; //录音中
            if (dataset.index == that.data.tabIndex) return;
            that.setData({
                tabIndex: dataset.index
            })
        } else if (dataset.types === 'content') {
            if (that.data.status) return; //录音中
            that.setData({
                contentVal: event.detail.value
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
                                if (that.data.playing) { //停止播放录音
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
            if (that.data.status) return; //录音中
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
        } else if (dataset.types === 'upload') {
            if (that.data.status) return; //录音中
            let imgList = that.data.imgList;
            let imgListArr = that.state.imgArr;
            if (imgList.length >= 9) {
                common.showClickModal('请先删除部分图片');
                return false;
            }
            common.uploadImg((9 - imgList.length), (photoUrl, tempFilePaths) => {
                tempFilePaths.forEach((url) => {
                    imgList.push(url);
                });

                photoUrl.forEach((obj) => {
                    //console.log(JSON.parse(obj.data).key);
                    let img = JSON.parse(obj.data).key;
                    imgListArr.push(img);
                });

                that.state.imgArr = imgListArr;
                that.setData({
                    imgList
                });
            });
        } else if (dataset.types === 'removeImg') {
            if (that.data.status) return; //录音中
            let imgList = that.data.imgList;
            let imgArr = that.state.imgArr;
            let index = dataset.index;
            imgList.splice(index, 1);
            imgArr.splice(index, 1);
            that.state.imgArr = imgArr;
            that.setData({
                imgList
            })
        } else if (dataset.types === 'tutor') {
            if (that.data.status) return; //录音中
            let checkList = that.data.checkList;
            let index = dataset.index;
            let leng = 0;
            checkList.forEach((item) => {
                if (item.checked && !checkList[index].checked) {
                    leng += 1;
                }
            })
            if (leng > 2) {
                wx.showToast({
                    title: '最多选择3个导师',
                    icon: 'none'
                })
                return false;
            }
            if (checkList[index].checked) {
                checkList[index].checked = false;
            } else {
                checkList[index].checked = true;
            }
            that.setData({
                checkList
            })
        } else if (dataset.types === 'removeTutor') {
            if (that.data.status) return; //录音中
            let checkList = that.data.checkList;
            let id = dataset.id;
            checkList.forEach((item) => {
                if (item.id == id) {
                    item.checked = false;
                }
            })
            that.setData({
                checkList
            })
        } else if (dataset.types === 'closeTk') {
            that.setData({
                tutorTk: 'hide'
            })
        } else if (dataset.types === 'showTutor') {
            if (that.data.status) return; //录音中
            that.setData({
                tutorTk: 'show'
            })
        } else if (dataset.types === 'temporary') { //暂存
            if (that.data.status) return; //录音中
            let data = that.getSubmitVal();
            if (!data) return;

            data.tabIndex = that.data.tabIndex;
            if (that.data.imgList.length > 0) {
                data.imgArr = that.data.imgList;
            }
            console.log(data);

            let vals = {
                type: 3,
                data
            }

            wx.showLoading({
                title: '数据保存中...',
                mask: true
            })
            // 调用暂存
            common.requestCache(that, vals);

        } else if (dataset.types === 'submit') { //提交
            if (that.data.status) return; //录音中
            let vals = that.getSubmitVal();
            if (!vals) return;
            vals.type = that.data.typeTabArr[that.data.tabIndex].id;
            vals.wx_form_id = event.detail.formId;
            that.requestSubmit(vals);
        }
    },

    // 获取数据
    getSubmitVal() {
        let that = this;
        let data = {};

        if (that.data.contentVal == '') {
            common.showTimeToast('请填写分享内容');
            return false;
        }
        data.content = that.data.contentVal;

        if (that.data.aAudio) {
            data.audio = that.data.aAudio;
        }

        if (that.data.imgList.length > 0) {
            data.img = that.state.imgArr;
        }

        let checkList = that.data.checkList;
        let audit = '';
        checkList.forEach((item) => {
            if (item.checked) {
                if (audit == '') {
                    audit += item.id;
                } else {
                    audit += ',' + item.id;
                }
            }
        })
        let userInfo = that.data.userInfo;
        if (userInfo.status == 2 || userInfo.status == 6) {
            if (audit == '') {
                common.showClickModal('请选择导师');
                return false;
            }
            data.audit = audit;
        }

        return data;
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

    // 导师选择
    checkboxChange(e) {
        console.log(e);
        if (e.detail.value.length > 3) {
            wx.showToast({
                title: '最多选择3个',
                icon: ''
            })
        }
    },

    // 获取暂存数据
    getCache() {
        let that = this;
        common.requestGetCache(that, {
            type: 3
        }, (da) => {
            if (da) {
                if (da.status == 1) {
                    let publishData = da.content.data;
                    if (publishData) {
                        let checkList = that.data.checkList;
                        if (publishData.hasOwnProperty('audit')) {
                            let auditArr = publishData.audit.split(',');
                            for (let i = 0; i < checkList.length; i += 1) {
                                let item = checkList[i];
                                for (let j = 0; j < auditArr.length; j += 1) {
                                    if (item.id == auditArr[j]) {
                                        item.checked = true;
                                    }
                                }
                            }
                        }

                        let aAudio = '';
                        let imgList = [];
                        if (publishData.hasOwnProperty('audio')) {
                            aAudio = publishData.audio;
                        }
                        if (publishData.hasOwnProperty('img')) {
                            imgList = publishData.imgArr;
                            that.state.imgArr = publishData.img;
                        }

                        that.setData({
                            tabIndex: publishData.tabIndex,
                            aAudio,
                            contentVal: publishData.content,
                            imgList,
                            checkList
                        })
                        that.state.imgArr = publishData.img;
                    }
                }
            }
        })
    },

    // 调用分类接口
    requestGetCate() {
        let that = this;
        let data = {
            type: 2
        }
        common.requestCate(data, (res) => {
            that.requestGetTutor();
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 获取导师 即关注的知士
    requestGetTutor() {
        let that = this;
        let url = 'api/SelfCenter/getInfo';
        let data = {
            offset: 0,
            limit: 20,
            status: 2
        }
        util.httpRequest(url, data).then((res) => {
            that.getCache();
            wx.hideLoading();
            if (res.result === 'success') {
                let checkList = res.results;
                checkList.forEach((item) => {
                    item.checked = false;
                })
                that.setData({
                    checkList
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 提交发布
    requestSubmit(vals) {
        let that = this;
        let url = 'api/Share/save';
        wx.showLoading({
            title: '发布中...',
            mask: true
        });
        if (vals.hasOwnProperty('audio')) {//判断是否有语音 有则执行上传
            that.uploadAudio(vals);
        } else {
            util.httpRequest(url, vals, 'POST').then((res) => {
                wx.hideLoading();
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
    },


    // 上传语音
    uploadAudio(vals) {
        let that = this;
        let url = 'api/Index/getToken';
        util.httpRequest(url).then((res) => {
            return wx.pro.uploadFile({
                url: 'https://upload-z2.qiniup.com',
                filePath: that.data.aAudio,
                name: 'file',
                formData: {
                    token: res.token
                }
            });
        }).then((res) => {
            let key = JSON.parse(res.data).key;
            vals.audio = key;
            let saveUrl = 'api/Share/save';
            util.httpRequest(saveUrl, vals, 'POST').then((res) => {
                wx.hideLoading();
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
            });
        });
    }

})