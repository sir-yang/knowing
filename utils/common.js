let util = require('util.js');

//弹框
function showClickModal(title) {
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: title,
        showCancel: false,
        success(_res) {}
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
    if (!str || str == null || str == undefined || str === '' || str.length === 0 || re.test(str) || !str.trim()) {
        return true;
    }

    // let reNum = /^[0-9]+.?[0-9]*$/;
    // if (!reNum.test(str)) {
    //     let strValue = str.replace(/\n/g, '');
    //     if (jsTrim(strValue) == '') {
    //         return true;
    //     }
    // }
    return false;
}

// 截取字符串
function stringObject(str, leng) {
    str = str.substring(0, leng);
    return str;
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

// 图片上传的api
function singleUpload(res, path) {
    return wx.pro.uploadFile({
        url: 'https://upload-z2.qiniup.com',
        filePath: path,
        name: 'file',
        formData: {
            token: res.token
        }
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
        let url = 'api/Index/getToken';
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
        console.log(2, _res);
        wx.hideLoading();
        func(_res, tempFilePaths);
    });
}

// 拨打电话
function phoneCall(phone) {
    if (isNull(phone)) {
        showClickModal('暂无联系电话！');
        return;
    }
    wx.makePhoneCall({
        phoneNumber: phone
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
        }
    })
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


// 登录注册 数据
function loginRegistData(that) {
    that.setData({
        loginRegistTk: 'hide',
        showLogin: 'hide', //登录
        showRegist: 'hide', //注册
        showForget: 'hide', //忘记密码
        showPerfect: ['hide', 'hide', 'hide', 'hide'], //0:完善信息 1:学生 2:教师 3:其他
        identity: 1, //注册角色
        genderId: 1,
        CountdownVal: '发送验证码',
        CountdownTime: 60,
        onClick: true,
        clearTimeout: true,
        phoneVal: '',
        passwordVal: '',
        confirmVal: '',
        codeVal: '',
    })
}

// 登录注册弹框
function isLoginRegist(that, types) {
    getPersonInfo().then((userInfo) => {
        if (userInfo) {
            if (!userInfo.avatarUrl && !userInfo.nickName) {
                wx.redirectTo({
                    url: '/pages/launch/launch'
                })
                return;
            }

            // 判断是否需要登录
            let loginRegistTk = that.data.loginRegistTk;
            let showLogin = that.data.showLogin;
            let showPerfect = that.data.showPerfect;

            if (userInfo.statusId == 0) { //未登录
                loginRegistTk = 'show';
                showLogin = 'show';
                // 隐藏底部导航
                if (wx.hideTabBar()) {
                    wx.hideTabBar({});
                }
                that.setData({
                    loginRegistTk,
                    showLogin,
                    showPerfect
                })
                // 获取图片验证码
                requestGetImgSend(that);
            } else if (!userInfo.name) { //未完善信息
                // 隐藏底部导航
                if (wx.hideTabBar()) {
                    wx.hideTabBar({});
                }
                loginRegistTk = 'show';
                showPerfect[0] = 'show';
                showPerfect[userInfo.type] = 'show';
                that.setData({
                    loginRegistTk,
                    showLogin,
                    showPerfect
                })
            } else { //已登录
                if (types === 'index') {
                    wx.navigateTo({
                        url: '/pages/askQuestion/askQuestion'
                    })
                }
            }
        } else {
            wx.redirectTo({
                url: '/pages/launch/launch'
            })
        }
    });
}


// 登录注册事件
function loginRegistEvent(event, that) {
    let dataset = event.currentTarget.dataset;
    if (dataset.types === 'toForget') { //忘记密码
        that.setData({
            showLogin: 'hide',
            showForget: 'show',
            phoneVal: '',
            passwordVal: '',
            confirmVal: '',
            codeVal: '',
            CountdownVal: '发送验证码',
            CountdownTime: 60,
            onClick: true,
            clearTimeout: true
        })
    } else if (dataset.types === 'toRegist') { //去注册
        that.setData({
            showLogin: 'hide',
            showRegist: 'show',
            phoneVal: '',
            passwordVal: '',
            confirmVal: '',
            codeVal: '',
            CountdownVal: '发送验证码',
            CountdownTime: 60,
            onClick: true,
            clearTimeout: true
        })
    } else if (dataset.types === 'login') { //登录
        console.log(event);
        let vals = event.detail.value;
        console.log(vals);
        if (isNull(vals.phone)) {
            showTimeToast('请输入手机号');
            return false;
        }
        if (isNull(vals.password)) {
            showTimeToast('请输入密码');
            return false;
        }
        if (isNull(vals.code)) {
            showTimeToast('请输入验证码');
            return false;
        }
        vals.wx_form_id = event.detail.formId;
        requestLogin(that, vals);
    } else if (dataset.types === 'imgCode') {
        wx.showLoading({
            title: '',
            mask: true
        })
        // 调用图片验证码
        requestGetImgSend(that);
    } else if (dataset.types === 'sendCode') { //验证码
        if (isNull(that.data.phoneVal)) {
            showTimeToast('请先输入手机号');
            return false;
        }
        if (!that.data.onClick) return;
        requestGetSend(that, that.data.phoneVal);
    } else if (dataset.types === 'identity') { // 注册角色切换
        let index = event.currentTarget.dataset.index;
        if (index == that.data.identity) return;
        that.setData({
            identity: index
        })
    } else if (dataset.types === 'toLogin') { //去登录
        that.setData({
            showLogin: 'show',
            showRegist: 'hide',
            showForget: 'hide',
            phoneVal: '',
            passwordVal: '',
            codeVal: '',
        })
    } else if (dataset.types === 'phoneIpt') { //监听输入
        let phoneVal = that.data.phoneVal;
        let passwordVal = that.data.passwordVal;
        let confirmVal = that.data.confirmVal;
        let codeVal = that.data.codeVal;
        if (dataset.valtype === 'password') {
            passwordVal = event.detail.value;
        } else if (dataset.valtype === 'confirm') {
            confirmVal = event.detail.value;
        } else if (dataset.valtype === 'code') {
            codeVal = event.detail.value;
        } else {
            phoneVal = event.detail.value;
        }
        that.setData({
            phoneVal,
            passwordVal,
            confirmVal,
            codeVal
        })
    } else if (dataset.types === 'regist' || dataset.types === 'forget') { //注册
        let vals = event.detail.value;
        console.log(vals);
        if (isNull(vals.phone)) {
            showTimeToast('请输入手机号');
            return false;
        }
        if (isNull(vals.password)) {
            showTimeToast('请输入密码');
            return false;
        }
        if (vals.password != vals.confirm) {
            showTimeToast('两次密码不一致');
            return false;
        }
        if (isNull(vals.code)) {
            showTimeToast('请输入验证码');
            return false;
        }
        vals.wx_form_id = event.detail.formId;
        if (dataset.types === 'regist') { //注册
            vals.type = that.data.identity;
            requestRegist(that, vals);
        } else { //忘记密码
            requestForGet(that, vals);
        }
    } else if (dataset.types === 'genderId') { //性别选择
        let index = event.currentTarget.dataset.index;
        if (index == that.data.genderId) return;
        that.setData({
            genderId: index
        })
    } else if (dataset.types === 'perfect') { //完善信息
        let vals = event.detail.value;

        if (isNull(vals.name)) {
            showTimeToast('请输入姓名');
            return false;
        }

        // if (isNull(vals.code)) {
        //     showTimeToast('请输入验证码');
        //     return false;
        // }
        vals.wx_form_id = event.detail.formId;

        requestSavePerfect(that, vals);
    } else if (dataset.types === 'school') { //选择学校
        let schoolList = that.data.schoolList;
        that.setData({
            schoolIdx: event.detail.value,
            collegeList: schoolList[event.detail.value].academy,
            collegeIdx: 0
        })
    } else if (dataset.types === 'college') { //选择学院
        that.setData({
            collegeIdx: event.detail.value
        })
    } else if (dataset.types === 'education') {
        that.setData({
            educationIdx: event.detail.value
        })
    }
}

// 发送验证码倒计时
function settime(that) {
    let interval = setTimeout(() => {
        if (!that.data.clearTimeout) {
            clearTimeout(interval);
        } else {
            let CountdownTime = that.data.CountdownTime;
            let CountdownVal = that.data.CountdownVal;
            let onClick = that.data.onClick;
            if (CountdownTime === 0) {
                CountdownVal = '发送验证码';
                CountdownTime = 60;
                onClick = true;
                clearTimeout(interval);
            } else {
                CountdownVal = '重新发送(' + that.data.CountdownTime + ')';
                CountdownTime -= 1;
                settime(that);
            }
            that.setData({
                CountdownVal,
                CountdownTime,
                onClick
            });
        }
    }, 1000);
}


// =================  公共接口 ============== //

// 引导
function requestLoadPage(that) {
    let url = 'api/Configs/getLead';
    util.httpRequest(url).then((res) => {
        if (res.result === 'success') {
            that.setData({
                loadImg: res.results
            })
        } else {
            showClickModal(res.msg);
        }
    })
}


// 登录
function requestLogin(that, vals) {
    let url = 'api/Login/login';
    wx.showLoading({
        title: '',
        mask: true
    })
    util.httpRequest(url, vals, 'POST').then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            let userInfo = getInfo('userInfo');
            let showPerfect = that.data.showPerfect;
            let loginRegistTk = 'hide';
            if (isNull(userInfo.name)) { //未完善资料
                showPerfect[0] = 'show';
                showPerfect[that.data.identity] = 'show';
                loginRegistTk = 'show';
            } else {
                // 调用接口
                if (that.data.pageName === 'index') {
                    let userInfo = getInfo('userInfo');
                    let role = 2;
                    if (userInfo.status != 5 && userInfo.status != 6 && userInfo.status != 8) {
                        role = 1;
                    }
                    that.setData({
                        role
                    })
                    that.requestList(0);
                }
                // 显示导航
                if (wx.showTabBar()) {
                    wx.showTabBar({});
                }
            }
            that.setData({
                loginRegistTk,
                showLogin: 'hide',
                showPerfect,
                phoneVal: '',
                passwordVal: '',
                codeVal: '',
            })
        } else {
            showClickModal(res.msg);
        }
    });
}

// 注册
function requestRegist(that, vals) {
    let url = 'api/Login/save';
    wx.showLoading({
        title: '提交中...',
        mask: true
    })
    util.httpRequest(url, vals, 'POST').then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            let showPerfect = that.data.showPerfect;
            showPerfect[0] = 'show';
            showPerfect[that.data.identity] = 'show';
            that.setData({
                showRegist: 'hide',
                loginRegistTk: 'show',
                showPerfect
            })
        } else {
            showClickModal(res.msg);
        }
    })
}

// 忘记密码
function requestForGet(that, vals) {
    let url = 'api/Login/edits';
    wx.showLoading({
        title: '提交中...',
        mask: true
    })
    let userInfo = getInfo('userInfo');
    vals.id = userInfo.id;
    util.httpRequest(url, vals, 'POST').then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            requestGetImgSend(that);
            that.setData({
                showForget: 'hide',
                showLogin: 'show',
                phoneVal: '',
                passwordVal: '',
                codeVal: '',
            })
        } else {
            showClickModal(res.msg);
        }
    })
}

// 学校 学院列表
function requestGetCollege(that) {
    let url = 'api/login/college';
    util.httpRequest(url).then((res) => {
        if (res.result === 'success') {
            that.setData({
                schoolList: res.results
            })
        } else {
            showClickModal(res.msg);
        }
    });
}

// 完善信息
function requestSavePerfect(that, vals) {
    let url = 'api/User/save';
    wx.showLoading({
        title: '提交中...',
        mask: true
    })
    util.httpRequest(url, vals, 'POST').then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            // 重新获取用户信息
            getPersonInfo().then(() => {
                // 重新获取列表
                that.requestList(0);
            })

            let showPerfect = that.data.showPerfect;
            showPerfect[0] = 'hide';
            showPerfect[that.data.identity] = 'hide';
            that.setData({
                loginRegistTk: 'hide',
                showPerfect
            })
            // 显示导航
            if (wx.showTabBar()) {
                wx.showTabBar({});
            }
        } else {
            showClickModal(res.msg);
        }
    });
}

// 问答分类
function requestCate(data, func) {
    let url = "api/Cate/getPage";
    return util.httpRequest(url, data).then((res) => {
        return func(res);
    })
}

// 获取提问金额
function requestGetMoney(that) {
    let url = 'api/Answer/getMoney';
    util.httpRequest(url).then((res) => {
        if (res.result === 'success') {
            that.setData({
                moneyData: res.results.money,
                getMoney: res.results
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
        return func(res);
    });
}

// 获取短信验证码
function requestGetSend(that, phone) {
    let url = 'api/Login/send';
    that.setData({
        onClick: false
    })
    util.httpRequest(url, {
        phone: phone
    }).then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            showTimeToast('发送成功');
            settime(that);
        } else {
            showClickModal(res.msg);
            that.setData({
                onClick: true
            })
        }
    });
}

// 获取图片验证码
function requestGetImgSend(that) {
    let url = 'api/Login/imgCode';
    util.httpRequest(url).then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            that.setData({
                imgCodeUrl: res.results
            })
        } else {
            showClickModal(res.msg);
        }
    });
}

// 暂存数据 提问/回答/发布
function requestCache(that, vals) {
    let url = 'api/Answer/answerCache';
    util.httpRequest(url, vals, 'POST').then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            if (res.result === 'success') {
                wx.showModal({
                    title: '提示',
                    content: '数据保存成功',
                    showCancel: false,
                    success() {
                        wx.navigateBack({});
                    },
                    fail(res) {
                        common.showClickModal(res.errMsg);
                    }
                })
            }
        } else {
            common.showClickModal(res.msg);
        }
    })
}

// 获取暂存数据 提问/回答/发布
function requestGetCache(that, vals, func) {
    let url = 'api/Answer/getCache';
    util.httpRequest(url, vals).then((res) => {
        wx.hideLoading();
        if (res.result === 'success') {
            func(res.results);
        } else {
            common.showClickModal(res.msg);
        }
    })
}

// 调用支付
function requestPay(info, func) {
    wx.requestPayment({
        timeStamp: info.timeStamp,
        nonceStr: info.nonceStr,
        package: info.package,
        signType: info.signType,
        paySign: info.paySign,
        success(res) {
            func('success', res);
        },
        fail(err) {
            func('fail', err);
        }
    })
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
    stringObject,
    getPersonInfo,
    timeCountDown,
    seeBigImg,
    uploadImg,
    phoneCall,

    requestLoadPage,
    loginRegistData,
    isLoginRegist,
    loginRegistEvent,
    requestLogin,
    requestGetCollege,
    requestCate,
    requestGetMoney,
    requestQiniuToken,
    requestGetSend,
    requestGetImgSend,
    requestCache,
    requestGetCache,
    requestPay
};