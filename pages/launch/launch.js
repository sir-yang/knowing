let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadStatus: true,
        userInfo: {},
        hasUserInfo: false,
        loadImg: []
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
        
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this;
        let token = common.getAccessToken();
        console.log(token);
        if (token) {
            common.requestLoadPage(that);
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                common.requestLoadPage(that);
            };
        }
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.avatarUrl && userInfo.nickName) {
            this.setData({
                userInfo,
                hasUserInfo: true
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
                common.getPersonInfo().then(() => {});
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})