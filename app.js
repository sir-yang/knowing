import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    onLaunch(_options) {
        wx.setStorageSync("serverurl", "https://soossy.com/");
        if (wx.getStorageSync('loadStatus') != false) {//首次进入
            wx.setStorageSync("loadStatus", true); 
        }
    },

    onShow(options) {
        console.log('app', options);
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
    },

    globalData: {
        commonFun: common,
        utilFun: util
    }
});