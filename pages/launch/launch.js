let commom = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadStatus: true,
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // console.log(getApp().globalData.isLaunch);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo.hasOwnProperty('nickName')) {
            this.setData({
                userInfo,
                hasUserInfo: true
            })
        }
    },

    // 获取个人信息
    getUserInfo(event) {
        console.log(event.detail.userInfo);
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
            this.requestSaveInfo(vals);
        }
    },

    // 保存基本信息
    requestSaveInfo(vals) {
        let that = this;
        let url = 'api/User/saveUser';
        util.httpRequest(url, vals, 'POST').then((res) => {
            if (res.result === 'success') {
                commom().getPersonInfo().then(() => {});
            } else {
                commom.showClickModal(res.msg);
            }
        });
    }
})