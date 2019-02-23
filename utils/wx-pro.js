const Promise = require('../polyfill/es6-promise.js').Promise;
let common = require('../utils/common.js');

function promisify() {
    wx.pro = {}; // wx.pro 下面挂载着返回 promise 的 wx.API
    // 普通的要转换的函数
    const functionNames = [
        'login',
        'getUserInfo',
        'navigateTo',
        'checkSession',
        'getStorageInfo',
        'removeStorage',
        'clearStorage',
        'getNetworkType',
        'getSystemInfo',
        'chooseImage', //选择图片
        'uploadFile', //上传图片,
        'chooseLocation', //选择地址,
        'getImageInfo',
        'requestPayment',
        'getLocation'
    ];

    functionNames.forEach((fnName) => {
        wx.pro[fnName] = (obj = {}) => new Promise((resolve, reject) => {
            obj.success = function(res) {
                //console.log(`wx.${fnName} success`, res)
                resolve(res);
            };
            obj.fail = function(err) {
                //console.error(`wx.${fnName} fail`, err);
                wx.hideLoading();
                reject(err);
            };
            wx[fnName](obj);
        });
    });

    wx.pro.fromSync = (fun) => new Promise((resolve, reject) => {
        try {
            resolve(fun());
        } catch (ex) {
            reject(ex);
        }
    });

    wx.pro.all = (arr) => Promise.all(arr);
    // 特殊改造的函数

    wx.pro.getStorage = (key) => new Promise((resolve, _reject) => {
        wx.getStorage({
            key,
            success: (res) => {
                resolve(res.data); // unwrap data
            },
            fail: (_err) => {
                resolve(); // not reject, resolve undefined
            }
        });
    });

    wx.pro.setStorage = (key, value) => new Promise((resolve, reject) => {
        wx.setStorage({
            key,
            data: value,
            success: (_res) => {
                resolve(value); // 将数据返回
            },
            fail: (err) => {
                reject(err);
            }
        });
    });

    wx.pro.request = (options) => {
        if (options.toast) {
            wx.showToast({
                title: options.toast.title || '加载中',
                icon: 'loading'
            });
        }

        return new Promise((resolve, reject) => {
            console.log(options.url);
            let req = {
                url: wx.getStorageSync('serverurl') + options.url,
                method: options.method || 'GET',
                header: {
                    'token': wx.getStorageSync('token')
                },
                success: (res) => {
                    wx.removeStorageSync("formId")
                    if (res.statusCode >= 400) {
                        console.log(res);
                        //console.error('wx.request fail [business]', res.statusCode, res.data)
                        if (res.statusCode === 401) {
                            wx.removeStorageSync("token");
                            //wx.request(req);
                        }
                        wx.hideLoading();
                        reject(res);
                    } else {
                        //console.log('wx.request success', res.data)
                        resolve(res.data); // unwrap data
                        if (!res.data) {
                            wx.hideLoading();
                        }
                    }
                },
                fail: (err) => {
                    console.log(JSON.stringify(err));
                    console.error('wx.request fail [network]', options, err);
                    reject(err);
                    wx.hideLoading();
                }
            };
            if (options.data) {
                req.data = options.data;
                req.header['content-type'] = 'application/json';
            }
            wx.request(req);
        });
    };
}


promisify();

module.exports = Promise;