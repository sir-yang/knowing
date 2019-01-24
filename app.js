import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    checkToken: false,
    onLaunch(_options) {
        this.checkToken = true;
        wx.setStorageSync("serverurl", "http://shuzhi.loaderwang.cn/");
        if (wx.getStorageSync('loadStatus') != false) {//首次进入
            wx.setStorageSync("loadStatus", true); 
        }
    },

    onShow(options) {
        console.log('app', options);
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
            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                console.log(res);
            })
            updateManager.onUpdateReady(function() {
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
            }
            that.refresh(options);
        }).catch((_e) => {
            //移出token
            wx.removeStorageSync('token');
            wx.removeStorageSync('expire_at');
            that.refresh(options);
        });
    },

    // 刷新token
    refresh(_options) {
        common.getToken().then((_res) => {
            getApp().globalData.tokenUpdated();
            // common.getPersonInfo().then((_re) => {
            //     getApp().globalData.tokenUpdated();
            // });
        });
    },

    globalData: {
        commonFun: common,
        utilFun: util,
        isLaunch: 0,
        tokenUpdated: null
    }
});