let util = require('util.js');

//弹框
function showClickModal(title) {
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: title,
        showCancel: false,
        confirmColor: '#FEA2C5',
        success(_res) { }
    });
}

function showTimeToast(title) {
    wx.showToast({
        title,
        duration: 2000,
        icon: 'none',
        mask: true
    });
}

// 保存数据事件
function setInfo(key, data) {
    try {
        wx.setStorageSync(key, data);
    } catch (event) {
        console.log(event);
    }
}

// 获取已保存数据
function getInfo(key) {
    try {
        let value = wx.getStorageSync(key);
        if (value) {
            return value;
        }
        return null;
    } catch (event) {
        console.log(event);
    }
    return null;
}


/**
 * 移出token
 */
function removeAccessToken() {
    try {
        wx.removeStorageSync('token');
        wx.removeStorageSync('expire_at');
    } catch (event) {
        console.log(event);
    }
}

/**
 * 获取token
 */
function getAccessToken() {
    let accessToken = getInfo('token');
    if (!accessToken) {
        return null;
    }
    let expireAt = getInfo('expire_at');
    if (expireAt) {
        let now = Date.parse(new Date());
        if (now < expireAt) {
            return accessToken;
        }
    }
    removeAccessToken();
    return null;
}

/**
 * 处理并保存token
 */
function setToken(token) {
    setInfo('token', token.token);
    setInfo('refresh_token', token.fresh_token);
    //提前一半的时间就要刷新
    let expireIn = token.token_expire * 1000;
    setInfo('expire_at', expireIn);
}
/**
 * 获取token
 */
function getToken() {
    //调用登录接口
    return wx.pro.login({

    }).then((res) => {
        let wxcode = res.code;
        let values = {
            code: wxcode,
        };
        let url = 'api/Oauth/createToken';
        return util.httpRequest(url, values, 'POST');
    }).then((data) => {
        if (data.result == 'success') {
            setToken(data.results);
        } else {
            console.log(data.msg);
        }
        return data;
    });
}

/**
 * 刷新token
 */
function refreshToken() {
    let values = {
        fresh_token: getInfo('refresh_token')
    };
    let url = 'api/Oauth/refresh';
    return util.httpRequest(url, values, 'POST').then((data) => {
        if (data.err_code == 0) {
            setToken(data.token);
            return data;
        }
        return getToken();
    }).catch((res) => {
        wx.removeStorageSync('refresh_token');
        return res;
    });
}

/**
 * 空对象判断
 * @obj  需要判断的字符串
 */
function nullObj(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

/**
 * 判断是否为空
 * @str  需要判断的字符串
 */
function isNull(str) {
    let regu = '^[ ]+$';
    let re = new RegExp(regu);
    if (!str || str == null || str === '' || str.length === 0 || re.test(str)) {
        return true;
    }
    let reNum = /^[0-9]+.?[0-9]*$/;
    if (!reNum.test(str)) {
        let strValue = str.replace(/\n/g, '');
        if (jsTrim(strValue) == '') {
            return true;
        }
    }
    return false;
}

// 列表接口数据处理
function dataListHandle(that, data, list, offset) {
    wx.stopPullDownRefresh();
    if (data.count > 0) {
        if (offset === 0) {
            list = data.results;
        } else {
            list = list.concat(data.results);
        }
    } else if (offset === 0) {
        list = [];
    }
    let hasNext = true;
    if (data.hasOwnProperty('next')) {
        console.log('count:' + data.count + ';next:' + data.next);
        if (data.next === 0) {
            that.state.hasmore = false;
            hasNext = false;
        } else {
            that.state.hasmore = true;
            hasNext = true;
        }
    } else {
        that.state.hasmore = false;
    }

    that.state.pageOnShow = true;
    that.state.isOnReachBottom = true;
    that.state.isonPullDownRefresh = false;
    wx.hideLoading();
    return {
        list,
        hasNext,
        count: data.count
    };
}

// 查看大图
function seeBigImg(imgUrl, imgList, types) {
    let urls = [];
    if (types == 2) {
        for (let i = 0; i < imgList.length; i += 1) {
            urls[i] = imgList[i].original_url;
        }
    } else {
        urls = imgList;
    }

    wx.previewImage({
        current: imgUrl, // 当前显示图片的http链接
        urls // 需要预览的图片http链接列表
    });
}

// 上传图片
function uploadImg(num, func) {
    let tempFilePaths = '';
    wx.pro.chooseImage({
        count: num, //最多可以选择的图片张数，默认9
        sizeType: ['compressed'], // 指定是压缩图
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
    }).then((res) => {
        // console.log(JSON.stringify(res));
        tempFilePaths = res.tempFilePaths;
        let url = '/album/0/photo_upload_url/?scenario=' + scenario;
        return util.httpRequest(url);
    }).then((res) => {
        //console.log(JSON.stringify(res));
        wx.showLoading({
            title: '上传中，请稍等...'
        });
        let pros = [];
        tempFilePaths.forEach((path) => {
            pros.push(singleUpload(res, path));
        });
        return wx.pro.all(pros);
    }).then((_res) => {
        wx.hideLoading();
        func(_res, tempFilePaths);
    });
}

/**
 * 获取用户信息
 */
function getPersonInfo() {
    let url = "api/User/getUser";
    return util.httpRequest(url).then((res) => {
        if (res.result == "success") {
            setInfo('userInfo', res.results);
            return res.results;
        } else {
            showClickModal(res.msg);
            wx.hideLoading()
        }
    })
}


/**
 * 绑定用户信息
 */
function userInfoBind(that, event) {
    let detail = event.detail;
    if (detail.hasOwnProperty('userInfo')) {
        wx.showLoading({
            title: '绑定中...',
            mask: true
        });
        let val = {
            nickName: detail.userInfo.nickName,
            face: detail.userInfo.avatarUrl,
            gender: detail.userInfo.gender
        };

        let url = 'api/user/saveUser';
        util.httpRequest(url, val, 'POST').then((res) => {
            console.log(JSON.stringify(res));
            wx.hideLoading();
            if (res.result == 'success') {
                that.setData({
                    authALter: false
                });
                //重新获取信息
                getPersonInfo().then(() => {});
            } else {
                showClickModal('绑定失败');
            }
        });
    }
}

// 倒计时
function timeCountDown(that, timestamp) {
    let now = Date.parse(new Date());
    let t = (timestamp * 1000) - now;
    if (Number(t) <= 0) {
        return {
            day: '0',
            hour: '00',
            minute: '00',
            second: '00'
        };
    }

    let leftsecond = parseInt(t / 1000);
    let day = Math.floor(leftsecond / (60 * 60 * 24));
    let hour = Math.floor((leftsecond - (day * 24 * 60 * 60)) / 3600);
    let minute = Math.floor((leftsecond - (day * 24 * 60 * 60) - (hour * 3600)) / 60);
    let second = Math.floor(leftsecond - (day * 24 * 60 * 60) - (hour * 3600) - (minute * 60));
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }
    return {
        day,
        hour,
        minute,
        second
    };
}




// =================  公共接口 ============== //


// 问答分类
function requestCate(func) {
    let url = "api/Cate/getPage";
    return util.httpRequest(url, { type: 1 }).then((res) => {
        return func(res);
    })
}

// 获取提问金额
function requestGetMoney(that) {
    let url = 'api/Answer/getMoney';
    util.httpRequest(url).then((res) => {
        if (res.result === 'success') {
            that.setData({
                moneyData: res.results
            })
        } else {
            showClickModal(res.msg);
        }
    });
}

// 七牛上传文件token
function requestQiniuToken(func) {
    let url = 'api/Index/getToken';
    util.httpRequest(url).then((res) => {
        if (res.result === 'success') {
            return func(res);
        } else {
            showClickModal(res.msg);
        }
    });
}

// 获取验证码
function requestGetSend(phone) {
    let url = 'api/Login/send';
    util.httpRequest(url, { phone: phone }).then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            
        } else {
            showClickModal(res.msg);
        }
    });
}




module.exports = {
    setStorage: setInfo,
    getStorage: getInfo,
    getAccessToken,
    getToken,
    refreshToken,
    showClickModal,
    showTimeToast,
    dataListHandle,
    nullObj,
    isNull,
    getPersonInfo,
    userInfoBind,
    timeCountDown,
    seeBigImg,
    uploadImg,

    requestCate,
    requestGetMoney,
    requestQiniuToken
};