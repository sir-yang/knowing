import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    onLaunch(_options) {
        checkToken: false,
        wx.setStorageSync("serverurl", "http://192.168.0.104/");
    },

    onShow(options) {
        let that = this;
        wx.getSystemInfo({
            success(res) {
                let SDKVersion = res.SDKVersion;
                if (SDKVersion == '1.0.0' || SDKVersion == '1.0.1' || SDKVersion == undefined) {
                    wx.showModal({
                        title: '提示',
                        content: '当前微信版本过低，请升级至高版本',
                        showCancel: false,
                        confirmColor: '#FEA2C5'
                    });
                }
            }
        });

        //更新
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                console.log(res);
            })
            updateManager.onUpdateReady(function () {
                console.log("新的版本已经下载好");
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
            })
        }

        wx.pro.checkSession().then(() => {
            let token = common.getAccessToken();
            if (!token) {
                console.log('no token');
            } else if (that.checkToken) {
                that.checkToken = false;
                let myInfo = common.getStorage('userInfo');
                if (!myInfo.avatarUrl && !myInfo.nickName) {
                    wx.reLaunch({
                        url: '/pages/launch/launch'
                    })
                    return common.getPersonInfo().then(() => {});
                } else {
                    wx.switchTab({
                        url: '/pages/index/index'
                    })
                }
            }
            that.refresh(options);
        }).catch((_e) => {
            that.refresh(options);
        });
    },

    // 刷新token
    refresh(_options) {
        common.getToken().then((_res) => {
            common.getPersonInfo().then((_re) => {
                getApp().globalData.tokenUpdated();
            });
        });
    },

    globalData: {
        commonFun: common,
        utilFun: util,
        isLaunch: 0,
        tokenUpdated: null
    }
});