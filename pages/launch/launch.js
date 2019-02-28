let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadStatus: false,
        userInfo: {},
        hasUserInfo: false
    },

    state: {
        options: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.state.options = options;
        console.log(this.state.options);
        let that = this;
        this.requestGetCofig();
        common.getPersonInfo().then((info) => {
            that.launchLoad(info);
        });
    },

    launchLoad(userInfo) {
        if (userInfo && userInfo.avatarUrl && userInfo.nickName) {
            if (common.getStorage('loadStatus')) {
                common.setStorage('loadStatus', false);
                this.setData({
                    userInfo,
                    hasUserInfo: true,
                    loadStatus: true
                })
            } else {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            }
        } else {
            this.setData({
                loadStatus: true
            })
        }
    },


    // 获取个人信息
    getUserInfo(event) {
        if (event.detail.userInfo) {
            let userInfo = event.detail.userInfo;
            wx.setStorageSync('userInfo', userInfo);
            this.setData({
                userInfo,
                hasUserInfo: true
            })

            let vals = {
                avatarUrl: userInfo.avatarUrl,
                nickName: userInfo.nickName,
                gender: userInfo.gender
            }
            if (this.state.options.hasOwnProperty('inviteId')) {
                vals.inviteId = this.state.options.inviteId;
            }
            this.requestSaveInfo(vals);
        }
    },

    // 保存基本信息
    requestSaveInfo(vals) {
        let that = this;
        let url = 'api/User/saveUser';
        util.httpRequest(url, vals, 'POST').then((res) => {
            if (res.result === 'success') {
                common.getPersonInfo().then(() => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    })
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 获取背景配置
    requestGetCofig() {
        let that = this;
        let url = 'api/Config/authorize';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                that.setData({
                    loadStatus: true,
                    backImg: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})